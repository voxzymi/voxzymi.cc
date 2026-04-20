// auth-guard.js
(function() {
    // 1. HIDDEN BY DEFAULT: Prevent "flicker" where users see tools for 0.5s
    const style = document.createElement('style');
    style.innerHTML = `body { display: none !important; }`;
    style.id = 'auth-hide-body';
    document.head.appendChild(style);

    async function getFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.fillText("voxzymi_v1", 2, 2);
            const hash = canvas.toDataURL().split('').reduce((a, b) => {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0);
            return Math.abs(hash).toString(16);
        } catch (e) { return "fp-blocked"; }
    }

    async function checkAuth() {
        const fp = await getFingerprint();
        const workerURL = "https://voxzymi-auth.andrewrobloxvapeconfigs.workers.dev/api/check-session";

        try {
            const response = await fetch(`${workerURL}?fp=${fp}`, { credentials: 'include' });
            const data = await response.json();

            if (data.active) {
                // SUCCESS: User is valid. Show the page.
                const hideStyle = document.getElementById('auth-hide-body');
                if (hideStyle) hideStyle.remove();
                console.log("Access Granted: " + data.uid);
            } else {
                // FAILURE: Redirect to a "Denied" message or Discord
                handleDenial(data.error);
            }
        } catch (err) {
            handleDenial("connection_error");
        }
    }

    function handleDenial(reason) {
        let msg = "Access Denied. Please login via Discord.";
        if (reason === "device_mismatch") {
            msg = "Security Alert: This account is logged in on another device.";
        }
        
        document.documentElement.innerHTML = `
            <div style="background:#0f0f0f; color:white; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif;">
                <h1 style="color:#ff4d4d">🔒 ${msg}</h1>
                <p>Go to the Discord server and use <b>/login</b></p>
                <a href="https://discord.com" style="color:#5865F2; text-decoration:none; margin-top:20px; border:1px solid #5865F2; padding:10px 20px; border-radius:5px;">Back to Discord</a>
            </div>`;
    }

    checkAuth();
})();