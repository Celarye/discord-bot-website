<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ref, watch } from "vue";

const props = defineProps<{
  open: boolean;
  pluginName: string | null;
  versions: string[];
  isLoading?: boolean;
  selectedVersion: string;
  mode: "add" | "configure";
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "update:selectedVersion", value: string): void;
  (e: "save" | "add"): void;
}>();

const localSelectedVersion = ref(props.selectedVersion);

watch(
  () => props.selectedVersion,
  (newVal) => {
    localSelectedVersion.value = newVal;
  },
);

watch(
  () => props.open,
  (newVal) => {
    if (newVal && props.selectedVersion) {
      localSelectedVersion.value = props.selectedVersion;
    }
  },
);

watch(localSelectedVersion, (newVal) => {
  emit("update:selectedVersion", newVal);
});

const closeDialog = () => {
  emit("update:open", false);
};

const handleSubmit = () => {
  if (props.mode === "add") {
    emit("add");
  } else {
    emit("save");
  }
  closeDialog();
};
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {{
            mode === "add" ? "Plugin Configuration for" : "Plugin Settings for"
          }}
          {{ pluginName }}
        </DialogTitle>
        <DialogDescription v-if="pluginName">
          {{
            mode === "add" ? "Configure and add plugin" : "Configure settings"
          }}
        </DialogDescription>
      </DialogHeader>

      <form
        v-if="pluginName"
        class="grid gap-4 py-4"
        @submit.prevent="handleSubmit"
      >
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="version" class="text-right">Version</Label>
          <div class="col-span-3">
            <Select v-model="localSelectedVersion">
              <SelectTrigger :disabled="isLoading">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="version in versions"
                  :key="version"
                  :value="version"
                >
                  {{ version }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="isLoading" class="text-xs text-muted-foreground mt-1">
              Loading available versions...
            </p>
            <p
              v-else-if="versions.length === 0"
              class="text-xs text-muted-foreground mt-1"
            >
              No additional versions available
            </p>
          </div>
        </div>

        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="setting1" class="text-right">Setting 1</Label>
          <Input
            id="setting1"
            placeholder="Setting 1 value"
            class="col-span-3"
          />
        </div>

        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="setting2" class="text-right">Setting 2</Label>
          <Input
            id="setting2"
            placeholder="Setting 2 value"
            class="col-span-3"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="closeDialog"
            >Cancel</Button
          >
          <Button type="submit" :disabled="isLoading">
            {{ mode === "add" ? "Add Plugin" : "Save changes" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
