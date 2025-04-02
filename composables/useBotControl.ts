import { ref } from 'vue';

export function useBotControl() {
    const botStatus = ref<'running' | 'stopped'>('stopped');
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    async function checkStatus() {
        error.value = null;
        try {
            const response = await fetch('/api/bot/status');
            const data = await response.json();
            botStatus.value = data.status;
            return data.status;
        } catch (err) {
            error.value = 'Failed to fetch bot status';
            console.error(error.value, err);
            return null;
        }
    }

    async function startBot() {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await fetch('/api/bot/start', {
                method: 'POST',
            });
            const data = await response.json();
            if (data.success) {
                botStatus.value = 'running';
                return true;
            } else {
                error.value = data.message || 'Failed to start bot';
                return false;
            }
        } catch (err) {
            error.value = 'Error starting bot';
            console.error(error.value, err);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    async function stopBot() {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await fetch('/api/bot/stop', {
                method: 'POST',
            });
            const data = await response.json();
            if (data.success) {
                botStatus.value = 'stopped';
                return true;
            } else {
                error.value = data.message || 'Failed to stop bot';
                return false;
            }
        } catch (err) {
            error.value = 'Error stopping bot';
            console.error(error.value, err);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        botStatus,
        isLoading,
        error,
        checkStatus,
        startBot,
        stopBot
    };
}