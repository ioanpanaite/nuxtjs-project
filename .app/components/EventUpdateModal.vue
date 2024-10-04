<script setup lang="ts">
import { z } from 'zod';
import { DatePicker } from 'v-calendar'
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';

import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'

const props = defineProps<{
  isModalOpen?: boolean,
  updateEvent: any,
  eventId: string
}>()

const VALIDATION_TEXT = {
  TITLE_REQUIRED: "Title can't be empty",
}

const udpateSchema = z
  .object({
    update_title: z.string().min(1, VALIDATION_TEXT.TITLE_REQUIRED),
    update_date: z.string(),
    event_link: z.string(),
    event_info: z.string(),
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type UpdateFormInput = z.infer<typeof udpateSchema>

const validationSchema = toTypedSchema(udpateSchema)
const initialValues = computed<UpdateFormInput>(() => ({
  update_title: props.updateEvent.eventTitle || '',
  update_date: props.updateEvent.eventDate || '',
  event_link: props.updateEvent.eventLink || '',
  event_info: props.updateEvent.eventInfo || '',
}))

const {
  handleSubmit: handleUpdateSubmit,
  isSubmitting: isUpdateSubmitting,
  setFieldError: setUpdateFieldError,
  meta: updateMeta,
  values: updateValues,
  errors: updateErrors,
  resetForm: updateResetForm,
  setFieldValue: updateSetFieldValue,
  setErrors: updateSetErrors,
} = useForm({
  validationSchema,
  initialValues,
})

const toaster = useToaster()
const onUpdate = handleUpdateSubmit(
  async (values) => {
    try {
      const formattedDate = getFormatDate(date.value)

      const body = {
        event_id: props.updateEvent.eventId,
        event_title: values.update_title,
        event_link: values.event_link,
        event_info: values.event_info,
        event_date: formattedDate,
      }

      const result = await useFetch('/api/site/event', { method: "PUT", body: body })

      if (result.data?.value?.ok) {
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `Event has been updated!`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })

      } else {
        toaster.clearAll()
        toaster.show({
          title: 'Oops!',
          message: "Something went wrong.",
          color: 'danger',
          icon: 'lucide:alert-triangle',
          closable: true,
        })
      }
    } catch (error: any) {
      document.documentElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      toaster.clearAll()
      toaster.show({
        title: 'Oops!',
        message: 'Please review the errors in the form',
        color: 'danger',
        icon: 'lucide:alert-triangle',
        closable: true,
      })
      return
    }

    updateResetForm()
    handleCloseModal()
  },
  (error) => {
    // this callback is optional and called only if the form has errors
    toaster.clearAll()
    toaster.show({
      title: 'Oops!',
      message: 'Something went wrong.',
      color: 'danger',
      icon: 'lucide:alert-triangle',
      closable: true,
    })
    handleCloseModal()
  },
)

const date = ref(new Date(props.updateEvent.eventDate))

const isModal = computed(() => props.isModalOpen)
const emit = defineEmits(['closeModal'])
const handleCloseModal = () => {
  emit('closeModal')
}
</script>

<template>
  <!-- Modal component -->
  <TairoModal :open="isModal" size="md" @close="handleCloseModal">
    <template #header>
      <!-- Header -->
      <div class="flex w-full items-center justify-between p-4 md:p-6">
        <div class="flex w-full items-center gap-2 ">
          <div
            class="bg-muted-100 dark:bg-muted-700/60 text-muted-400 flex h-[50px] w-[50px] items-center justify-center rounded-full">
            <Icon name="ph:sparkle-duotone" class="h-5 w-5" />
          </div>
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            Update Event
          </h3>
        </div>

        <BaseButtonClose @click="handleCloseModal" />
      </div>
    </template>

    <!-- Body -->
    <div class="p-4 md:p-6">
      <div class="mx-auto w-full max-w-xs">
        <form method="POST" action="" class="w-full pb-10" @submit.prevent="onUpdate">
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12">
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="update_title">
                <BaseInput :model-value="field.value" label="Event Title" :error="errorMessage"
                  :disabled="isUpdateSubmitting" type="text" icon="ph:subtitles-duotone" placeholder="Event Title"
                  @update:model-value="handleChange" @blur="handleBlur" />
              </Field>
            </div>
            <div class="col-span-12">
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="event_link">
                <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" type="text"
                  icon="ph:subtitles-duotone" label="Event Link" placeholder="Event Link"
                  @update:model-value="handleChange" @blur="handleBlur" />
              </Field>
            </div>
            <div class="col-span-12">
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="event_info">
                <BaseTextarea :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" label="Event Info"
                  shape="rounded" placeholder="Write event info..." @update:model-value="handleChange"
                  @blur="handleBlur" />
              </Field>
            </div>
            <div class="col-span-12">
              <DatePicker v-model="date" :masks="masks" :min-date="new Date()" mode="date" hide-time-header trim-weeks>
                <template #default="{ inputValue, inputEvents }">
                  <div class="flex w-full flex-col gap-4 sm:flex-row">
                    <div class="relative grow">
                      <Field v-slot="{
                        field,
                        errorMessage,
                        handleChange,
                        handleBlur,
                      }" name="update_date">
                        <BaseInput label="Event date" icon="ph:calendar-blank-duotone" :value="inputValue"
                          v-on="inputEvents" :classes="{
                            input: '!h-11 !ps-11',
                            icon: '!h-11 !w-11',
                          }" :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" type="text"
                          @update:model-value="handleChange" @blur="handleBlur" />
                      </Field>
                    </div>
                  </div>
                </template>
              </DatePicker>
            </div>
          </div>

          <div class="mx-auto pt-4 w-full flex justify-center">
            <BaseButton type="submit" color="primary" flavor="solid">
              Update
            </BaseButton>
          </div>
        </form>
      </div>
      <TairoFormSave :disabled="isUpdateSubmitting" :loading="isUpdateSubmitting" @reset="updateResetForm" />
    </div>

  </TairoModal>
</template>
