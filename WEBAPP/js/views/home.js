function loadHomeContent() {
    const mainContent = document.getElementById('mainContent');
    fetch('vistas/home.html')
        .then(response => response.text())
        .then(html => {
            mainContent.innerHTML = html;
            // Expose the orchestrator to the window and run it.
            window.orchestrateOnboardingFlow = orchestrateOnboardingFlow;
            window.orchestrateOnboardingFlow();
        })
        .catch(error => {
            console.error('Error loading home content:', error);
            mainContent.innerHTML = '<p>Error al cargar el contenido. Por favor, intente de nuevo más tarde.</p>';
        });
}

async function getViewState(key) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/view-states/${key}`);
        if (response.status === 404) return null; // Not found is a valid state
        if (response.ok) {
            const data = await response.json();
            return data.value;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching view state for ${key}:`, error);
        return null;
    }
}

async function updateViewState(key, value) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/view-states`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value }),
        });
        if (!response.ok) {
            console.error(`Failed to update view state for ${key}`);
        }
    } catch (error) {
        console.error(`Error updating view state for ${key}:`, error);
    }
}

async function orchestrateOnboardingFlow() {
    // Ensure all modal elements are queryable
    const welcomeModal = document.getElementById('welcomeModal');
    const gettingStartedModal = document.getElementById('gettingStartedModal');
    const scheduleModal = document.getElementById('scheduleModal');
    const openScheduleBubble = document.getElementById('openScheduleBubble');

    // Hide all modals by default to prevent overlaps
    welcomeModal.style.display = 'none';
    gettingStartedModal.style.display = 'none';
    scheduleModal.style.display = 'none';
    openScheduleBubble.style.display = 'none';

    const profileComplete = await getViewState('profile_complete');
    if (profileComplete !== 'true') {
        welcomeModal.style.display = 'flex';
        return;
    }

    const gettingStartedShown = await getViewState('getting_started_shown');
    if (gettingStartedShown !== 'true') {
        gettingStartedModal.style.display = 'flex';
        return;
    }

    const scheduleShown = await getViewState('schedule_shown');
    if (scheduleShown !== 'true') {
        // Show the modal and wait for the user to close it.
        const scheduleDecision = await window.showScheduleModal();
        
        // NOW, after the user is done, update the state.
        await updateViewState('schedule_shown', 'true');

        // If the user accepted the schedule, that becomes the final navigation choice.
        if (scheduleDecision === 'accepted') {
            await updateViewState('getting_started_choice', 'social');
        }

        // After it's done, re-run the orchestrator to proceed to the final state.
        return orchestrateOnboardingFlow();
    }

    // --- Onboarding is Complete ---
    openScheduleBubble.style.display = 'block';

    // Handle final navigation based on the user's choice in the "Getting Started" modal.
    const lastChoice = await getViewState('getting_started_choice');
    if (lastChoice && lastChoice !== 'closed' && lastChoice !== 'consumed') {
        // Mark the choice as 'consumed' so we don't navigate again on subsequent loads.
        await updateViewState('getting_started_choice', 'consumed');
        if (window.navigateToSection) {
            window.navigateToSection(lastChoice);
        }
    }
}
