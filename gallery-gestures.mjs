// Intent only: vertical motion is left to the browser; one released horizontal
// gesture produces one step, regardless of the distance or number of moves.
export function swipeDirection(dx, dy, width) {
  const threshold = Math.max(36, Math.min(64, width * .12));
  return Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.2
    ? dx < 0 ? 1 : -1
    : 0;
}
export function attachGallerySwipe(stage, onSwipe, enabled = () => true) {
  let gesture = null, suppressClickUntil = 0;
  const cancel = () => {
    if (gesture?.moved) suppressClickUntil=Date.now()+250;
    gesture=null;
  };
  const down = event => {
    if (event.isPrimary === false) { cancel(); return; }
    if (event.button > 0 || !enabled(event) || event.target.closest?.('button,a,input,textarea,select')) return;
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,width:stage.getBoundingClientRect().width,axis:null,moved:false,captured:false};
  };
  const move = event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    if(Math.max(Math.abs(dx),Math.abs(dy))<12)return;
    gesture.moved=true;
    if(!gesture.axis){
      if(Math.abs(dx)>Math.abs(dy)*1.2)gesture.axis='x';
      else if(Math.abs(dy)>Math.abs(dx)*1.2)gesture.axis='y';
      else return;
    }
    if(gesture.axis!=='x')return;
    if(!gesture.captured){
      gesture.captured=true;
      try{stage.setPointerCapture(event.pointerId);}catch{ /* Native cancellation can race with capture. */ }
    }
    if(event.cancelable)event.preventDefault();
  };
  const up = event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const start=gesture;gesture=null;
    if(start.moved)suppressClickUntil=Date.now()+250;
    if(start.axis!=='x')return;
    const direction=swipeDirection(event.clientX-start.x,event.clientY-start.y,start.width);
    if(direction)onSwipe(direction);
  };
  const lost = event => { if(event.target===stage)cancel(); };
  const click = event => {
    if (event.detail!==0&&Date.now()<suppressClickUntil&&!event.target.closest?.('button')) {
      event.preventDefault();event.stopPropagation();
    }
  };
  stage.addEventListener('pointerdown',down);
  stage.addEventListener('pointermove',move,{passive:false});
  stage.addEventListener('pointerup',up);
  stage.addEventListener('pointercancel',cancel);
  stage.addEventListener('lostpointercapture',lost);
  stage.addEventListener('click',click,true);
  return () => {
    stage.removeEventListener('pointerdown',down);stage.removeEventListener('pointermove',move);
    stage.removeEventListener('pointerup',up);stage.removeEventListener('pointercancel',cancel);
    stage.removeEventListener('lostpointercapture',lost);stage.removeEventListener('click',click,true);
  };
}
