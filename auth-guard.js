(async function() {
    // 1. Generate the fingerprint (Keep in mind this may return "fp-blocked" for strict browsers)
    async function getFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
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

    // 2. Fetch the actual content from the Worker, not just a true/false check
    async function initApp() {
        const fp = await getFingerprint();
        const match = document.cookie.match(/id=([^;]+)/);
        const uid = match ? match[1] : null;

        if (!uid) {
            showBlockedPage("no_session");
            return;
        }

        // Point this to an endpoint that returns the HTML/Data, not just { active: true }
        const workerURL = "https://voxzymi-auth.andrewrobloxvapeconfigs.workers.dev/api/get-secure-content";

        try {
            const response = await fetch(`${workerURL}?uid=${uid}&fp=${fp}`);

            if (response.ok) {
                // SUCCESS: The Worker verified the user and sent the protected HTML
                const secureContent = await response.text(); 
                
                // Inject the secure tools into the page
                document.body.innerHTML = secureContent; 
            } else {
                // FAILED: The Worker denied access (e.g., 401 or 403 status code)
                const data = await response.json();
                showBlockedPage(data.error || "access_denied");
            }
        } catch (err) {
            showBlockedPage("connection_error");
        }
    }

    // 3. The Block Page UI
    function showBlockedPage(errorType) {
        let title = "Access Denied";
        let message = "Please log in via Discord to access these tools.";
        
        if (errorType === "device_mismatch") {
            title = "Session Conflict";
            message = "You are currently logged in on another device. Please log out there or reset your session in Discord.";
        } else if (errorType === "connection_error") {
            title = "Connection Error";
            message = "Could not connect to the authentication server.";
        }

        document.documentElement.innerHTML = `
            <div style="background:#0a0a0a; color:white; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; padding:20px;">
                <div style="font-size:50px; margin-bottom:20px;">🔒</div>
                <h1 style="color:#ff4d4d; margin:0;">${title}</h1>
                <p style="color:#ccc; max-width:400px; line-height:1.5;">${message}</p>
                <a href="https://discord.com" style="margin-top:20px; padding:12px 25px; background:#5865F2; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">Return to Discord</a>
            </div>`;
    }

    // Start the process
    initApp();
})();