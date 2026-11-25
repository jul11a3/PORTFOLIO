/**
 * Functional transitions must never delay an action. Keep update callbacks
 * synchronous; do asynchronous loading separately from the page mutation.
 */
export function createTransition(document, reducedMotion, options = {}) {
  const timeoutMs = options.timeoutMs ?? 160;
  const onError = options.onError ?? (error => console.error(error));
  let active = null;
  const reduce = () => typeof reducedMotion === 'function'
    ? reducedMotion()
    : Boolean(reducedMotion?.matches ?? reducedMotion);
  const report = (run, error) => {
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError' || run.errors.has(error)) return;
    run.errors.add(error);
    try { onError(error); } catch { /* Reporting must not block the next action. */ }
  };
  const clear = run => {
    clearTimeout(run.timer);
    run.timer = null;
    if (active === run) active = null;
  };
  const skip = run => {
    if (run.skipped) return;
    run.skipped = true;
    try { run.transition?.skipTransition(); } catch (error) { report(run, error); }
  };
  const fallback = run => {
    skip(run);
    run.apply();
    clear(run);
  };
  return update => {
    // Do not discard an earlier action when a second action arrives during
    // capture. Apply it now; its late native callback is guarded below.
    if (active) {
      const previous = active;
      previous.apply();
      skip(previous);
      clear(previous);
    }
    const run = {applied:false, skipped:false, transition:null, timer:null, errors:new Set(), apply:null};
    run.apply = () => {
      if (run.applied) return;
      run.applied = true;
      try {
        const result = update();
        // Observe a returned promise as well, even though synchronous updates
        // are the supported contract for predictable action ordering.
        if (result && typeof result.then === 'function') {
          void Promise.resolve(result).catch(error => report(run, error));
        }
        return result;
      } catch (error) { report(run, error); }
    };
    if (!document.startViewTransition || reduce()) {
      run.apply();
      return;
    }
    active = run;
    try { run.transition = document.startViewTransition(run.apply); }
    catch (error) { report(run, error); fallback(run); return; }
    run.timer = setTimeout(() => fallback(run), timeoutMs);
    const observe = (promise, fulfilled) => {
      if (!promise || typeof promise.then !== 'function') return;
      void Promise.resolve(promise).then(fulfilled, error => {
        report(run, error);
        fallback(run);
      }).catch(error => report(run, error));
    };
    observe(run.transition.ready, () => {
      clearTimeout(run.timer);
      run.timer = null;
    });
    observe(run.transition.updateCallbackDone, () => {});
    observe(run.transition.finished, () => {
      run.apply();
      clear(run);
    });
    return run.transition;
  };
}
