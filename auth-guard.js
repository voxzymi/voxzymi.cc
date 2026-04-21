(async function() {
    const root = document.getElementById('root');

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

    async function checkAndLoad() {
        const fp = await getFingerprint();
        const match = document.cookie.match(/id=([^;]+)/);
        const uid = match ? match[1] : null;

        if (!uid) return showBlockedPage("no_session");

        const workerURL = "https://voxzymi-auth.andrewrobloxvapeconfigs.workers.dev/api/check-session";

        try {
            const response = await fetch(`${workerURL}?uid=${uid}&fp=${fp}`);
            const data = await response.json();

            if (data.active) {
                // FIX: Instead of unhiding, we FETCH the tool content now
                // Or if the tool is small, the worker can send the HTML in 'data.html'
                root.innerHTML = data.toolHTML; 
            } else {
                showBlockedPage(data.error);
            }
        } catch (err) {
            showBlockedPage("connection_error");
        }
    }

    function showBlockedPage(errorType) {
        root.innerHTML = `
            <div style="color:white; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif;">
                <h1 style="color:#ff4d4d;">Access Denied</h1>
                <p>${errorType === 'device_mismatch' ? 'Log out of your other device first.' : 'Please log in via Discord.'}</p>
            </div>`;
    }

    checkAndLoad();
})();