const Auth = {
    saveSession(username) {
        localStorage.setItem('cg_active_user', username);
        const accounts = JSON.parse(localStorage.getItem('cg_accounts') || '{}');
        if(!accounts[username]) accounts[username] = { bestScore: 0, joined: new Date() };
        localStorage.setItem('cg_accounts', JSON.stringify(accounts));
    },

    getSession() { return localStorage.getItem('cg_active_user'); },

    logout() { 
        localStorage.removeItem('cg_active_user'); 
        window.location.reload(); 
    },

    updateBest(score) {
        const user = this.getSession();
        const accounts = JSON.parse(localStorage.getItem('cg_accounts'));
        if(score > accounts[user].bestScore) {
            accounts[user].bestScore = score;
            localStorage.setItem('cg_accounts', JSON.stringify(accounts));
            return true;
        }
        return false;
    }
};
