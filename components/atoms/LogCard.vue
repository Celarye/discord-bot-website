<script setup lang="ts">
const props = defineProps<{
    type: "info" | "warning" | "error";
    message: string;
    timestamp: string;
}>();

const typeColor = {
    info: "text-blue-500",
    warning: "text-yellow-500",
    error: "text-red-500",
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
