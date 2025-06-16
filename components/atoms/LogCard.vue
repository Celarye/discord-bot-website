<script setup lang="ts">
const props = defineProps<{
    type: "info" | "warning" | "error" | "debug" | "trace";
    message: string;
    timestamp: string;
}>();

const typeColor = {
    info: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
    debug: "text-blue-500",
    trace: "text-purple-500",
}[props.type];
</script>

<template>
    <div class="border shadow rounded-lg p-4 mb-4">
        <div class="flex items-center justify-between mb-4">
            <p :class="typeColor">
                <strong>{{ type.toUpperCase() }}</strong>
            </p>
            <p>{{ timestamp }}</p>
        </div>
        <p>{{ message }}</p>
    </div>
</template>
