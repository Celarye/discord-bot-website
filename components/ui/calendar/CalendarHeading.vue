<script lang="ts" setup>
import { cn } from "@/lib/utils";
import { reactiveOmit } from "@vueuse/core";
import {
  CalendarHeading,
  useForwardProps,
  type CalendarHeadingProps,
} from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<
  CalendarHeadingProps & { class?: HTMLAttributes["class"] }
>();

defineSlots<{
  default: (props: { headingValue: string }) => any;
}>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <CalendarHeading
    v-slot="{ headingValue }"
    data-slot="calendar-heading"
    :class="cn('text-sm font-medium', props.class)"
    v-bind="forwardedProps"
  >
    <slot :heading-value>
      {{ headingValue }}
    </slot>
  </CalendarHeading>
</template>
