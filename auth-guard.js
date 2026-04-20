(function() {
    // Hide body immediately
    const style = document.createElement('style');
    style.innerHTML = `body { display: none !important; }`;
    style.id = 'auth-hide-body';
    document.head.appendChild(style);

    async function getFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.fillText("voxzymi_v1", 2, 2);
            const data = canvas.toDataURL();
            let hash = 0;
            for (let i = 0; i < data.length; i++) {
                hash = ((hash << 5) - hash) + data.charCodeAt(i);
                hash |= 0;
            }
            return Math.abs(hash).toString(16);
        } catch (e) { return "fp-blocked"; }
    }

    async function checkAuth() {
    const fp = await getFingerprint();
    
    // Read the "id" cookie directly from the browser
    const match = document.cookie.match(/id=([^;]+)/);
    const uid = match ? match[1] : null;

    if (!uid) {
        showBlockedPage("no_session");
        return;
    }

    const workerURL = "https://voxzymi-auth.andrewrobloxvapeconfigs.workers.dev/api/check-session";

    try {
        // We pass the UID and the FP to the worker to check against KV
        const response = await fetch(`${workerURL}?uid=${uid}&fp=${fp}`);
        const data = await response.json();

        if (data.active) {
            const hideStyle = document.getElementById('auth-hide-body');
            if (hideStyle) hideStyle.remove();
        } else {
            showBlockedPage(data.error);
        }
    } catch (err) {
        showBlockedPage("connection_error");
    }
}

    function showBlockedPage(errorType) {
        let title = "Access Denied";
        let message = "Please log in via Discord to access these tools.";
        
        if (errorType === "device_mismatch") {
            title = "Session Conflict";
            message = "You are currently logged in on another device. Please log out there or reset your session in Discord.";
        }

        document.documentElement.innerHTML = `
            <div style="background:#0a0a0a; color:white; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; padding:20px;">
                <div style="font-size:50px; margin-bottom:20px;">🔒</div>
                <h1 style="color:#ff4d4d; margin:0;">${title}</h1>
                <p style="color:#ccc; max-width:400px; line-height:1.5;">${message}</p>
                <a href="https://discord.com" style="margin-top:20px; padding:12px 25px; background:#5865F2; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">Return to Discord</a>
            </div>`;
    }

    checkAuth();
})();