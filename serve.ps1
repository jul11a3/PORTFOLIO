# 简单的 PowerShell 静态文件服务器
# 运行: powershell -ExecutionPolicy Bypass -File serve.ps1 -Port 4176
param([int]$Port = 4176)

Add-Type -TypeDefinition @"
using System;
using System.Net;
using System.IO;
using System.Text;

public class SimpleServer {
    public static void Start(string root, int port) {
        var listener = new HttpListener();
        listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
        listener.Start();
        Console.WriteLine("Serving {0} on http://127.0.0.1:{1}/", root, port);

        while (true) {
            var ctx = listener.GetContext();
            try {
                string urlPath = ctx.Request.Url.AbsolutePath;
                if (urlPath == "/") urlPath = "/index.html";
                string filePath = Path.Combine(root, urlPath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                
                if (File.Exists(filePath)) {
                    byte[] data = File.ReadAllBytes(filePath);
                    string ext = Path.GetExtension(filePath).ToLower();
                    string mime = "application/octet-stream";
                    switch (ext) {
                        case ".html": mime = "text/html; charset=utf-8"; break;
                        case ".css": mime = "text/css; charset=utf-8"; break;
                        case ".js": mime = "application/javascript; charset=utf-8"; break;
                        case ".mjs": mime = "application/javascript; charset=utf-8"; break;
                        case ".json": mime = "application/json; charset=utf-8"; break;
                        case ".svg": mime = "image/svg+xml"; break;
                        case ".png": mime = "image/png"; break;
                        case ".jpg": mime = "image/jpeg"; break;
                        case ".jpeg": mime = "image/jpeg"; break;
                        case ".gif": mime = "image/gif"; break;
                        case ".webp": mime = "image/webp"; break;
                        case ".wav": mime = "audio/wav"; break;
                        case ".mp3": mime = "audio/mpeg"; break;
                        case ".mp4": mime = "video/mp4"; break;
                        case ".webm": mime = "video/webm"; break;
                    }
                    ctx.Response.ContentType = mime;
                    ctx.Response.ContentLength64 = data.Length;
                    ctx.Response.AddHeader("Cache-Control", "no-cache");
                    ctx.Response.OutputStream.Write(data, 0, data.Length);
                } else {
                    ctx.Response.StatusCode = 404;
                    byte[] err = Encoding.UTF8.GetBytes("404 Not Found: " + urlPath);
                    ctx.Response.OutputStream.Write(err, 0, err.Length);
                }
            } catch (Exception ex) {
                ctx.Response.StatusCode = 500;
                byte[] err = Encoding.UTF8.GetBytes("500 Error: " + ex.Message);
                ctx.Response.OutputStream.Write(err, 0, err.Length);
            } finally {
                ctx.Response.OutputStream.Close();
            }
        }
    }
}
"@ -Language CSharp

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
[SimpleServer]::Start($root, $Port)
