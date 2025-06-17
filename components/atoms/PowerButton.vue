<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import { Power, PowerOff, RotateCw } from "lucide-vue-next";

const props = defineProps<{
  online: boolean;
}>();

const emit = defineEmits<{
  (e: "power", newState: "on" | "off"): void;
  (e: "restart"): void;
}>();

const state = computed(() => (props.online ? "on" : "off"));

function setState(newState: "on" | "off") {
  emit("power", newState);
}

function restart() {
  emit("restart");
}
</script>

<template>
  <div class="flex gap-2">
    <Button
      v-if="state === 'off'"
      variant="default"
      aria-label="Power On"
      @click="setState('on')"
    >
      <Power class="mr-2" />
      On
    </Button>
    <template v-else>
      <Button variant="default" aria-label="Power Off" @click="setState('off')">
        <PowerOff class="mr-2" />
        Off
      </Button>
      <Button variant="secondary" aria-label="Restart" @click="restart">
        <RotateCw class="mr-2" />
        Restart
      </Button>
    </template>
  </div>
</template>
