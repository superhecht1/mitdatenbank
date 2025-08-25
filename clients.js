// Modal öffnen/schließen
function showModal(id) {
    document.getElementById(id).style.display = 'block';
}
function hideModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Feedback anzeigen
function showFeedback(message, type = 'success') {
    const feedback = document.getElementById('clientFeedback');
    feedback.textContent = message;
    feedback.className = type === 'success' ? 'feedback success' : 'feedback error';
    setTimeout(() => {
        feedback.textContent = '';
        feedback.className = '';
    }, 3000);
}

// Client hinzufügen (Formular absenden)
document.querySelector('#clientModal form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const client = {
        initials: this.querySelector('input[placeholder="A.B."]').value.trim(),
        diagnosis: this.querySelector('input[placeholder^="z.B."]').value.trim(),
        therapy: this.querySelector('select').value,
        notes: this.querySelector('textarea').value.trim()
    };

    // Pflichtfelder prüfen
    if (!client.initials || !client.diagnosis || !client.therapy) {
        showFeedback("Bitte alle Pflichtfelder ausfüllen!", "error");
        return;
    }

    try {
        const response = await fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(client)
        });

        if (response.ok) {
            showFeedback("Klient gespeichert!");
            hideModal('clientModal');
            this.reset(); // Formular leeren
            loadClients();
        } else {
            showFeedback("Fehler beim Speichern!", "error");
        }
    } catch (err) {
        console.error(err);
        showFeedback("Serverfehler: Klient konnte nicht gespeichert werden.", "error");
    }
});

// Alle Clients laden
async function loadClients() {
    try {
        const res = await fetch('/api/clients');
        if (!res.ok) throw new Error("Fehler beim Laden der Clients");

        const clients = await res.json();
        const grid = document.getElementById('clientGrid');
        grid.innerHTML = '';

        clients.forEach(c => {
            const div = document.createElement('div');
            div.className = 'client-card';
            div.innerHTML = `
                <div class="client-header">
                    <div class="client-initials">${c.initials}</div>
                    <div class="client-meta">
                        <span class="tag">${c.diagnosis}</span>
                        <span class="tag">${c.therapy}</span>
                    </div>
                </div>
                <div class="client-stats">
                    <span>📝 ${c.notes || 'Keine Notizen'}</span>
                </div>
            `;
            grid.appendChild(div);
        });

        document.getElementById('clientsBadge').textContent = clients.length;
    } catch (err) {
        console.error(err);
        showFeedback("Fehler beim Laden der Klienten.", "error");
    }
}

// Direkt beim Start laden
window.addEventListener('DOMContentLoaded', loadClients);
