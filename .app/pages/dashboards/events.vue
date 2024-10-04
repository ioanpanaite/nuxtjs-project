<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';
import { DatePicker } from 'v-calendar'
import { z } from 'zod';
import { ref } from 'vue'

import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'

definePageMeta({
  title: 'Event Schedule',
  preview: {
    title: 'Events schedule management',
    description: 'For editing a evenet schedule',
    categories: ['users', 'edit', 'forms'],
    src: '/img/screens/layouts-subpages-profile-edit-1.png',
    srcDark: '/img/screens/layouts-subpages-profile-edit-1-dark.png',
    order: 76,
  },
})

// This is the object that will contain the validation messages
const VALIDATION_TEXT = {
  TITLE_REQUIRED: "Event title can't be empty",
  DATE_REQUIRED: "Event date can't be empty",
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    event_title: z.string().min(1, VALIDATION_TEXT.TITLE_REQUIRED),
    event_link: z.string(),
    event_info: z.string(),
    event_date: z.date().nullable(),
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const { data, pending, error, refresh } = await useFetch(`/api/site/event-list`)

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  event_title: '',
  event_link: '',
  event_info: '',
  event_date: null,
}))

const {
  handleSubmit,
  isSubmitting,
  setFieldError,
  meta,
  values,
  errors,
  resetForm,
  setFieldValue,
  setErrors,
} = useForm({
  validationSchema,
  initialValues,
})


const success = ref(false)
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)


const date = ref(new Date())

const masks = ref({
  input: 'YYYY-MM-DD',
})


// Ask the user for confirmation before leaving the page if the form has unsaved changes
onBeforeRouteLeave(() => {
  if (meta.value.dirty) {
    return confirm('You have unsaved changes. Are you sure you want to leave?')
  }
})

const toaster = useToaster()
const router = useRouter()

const handleDeleteEvent = async (eventId: string) => {
  const result = await useFetch(`/api/site/event`, { method: "DELETE", body: { eventId } })
  if (result.data.value?.ok) {
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: result.data.value?.message || `Event deleted succesfully!`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
  } else {
    toaster.clearAll()
    toaster.show({
      title: 'Oops!',
      message: 'Something went wrong',
      color: 'danger',
      icon: 'lucide:alert-triangle',
      closable: true,
    })
  }

  // we can refresh the data from the server
  // this will update the initial values and the current avatar
  await refresh()

  resetForm()

  document.documentElement.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    try {
      const body = {
        event_title: values.event_title,
        event_link: values.event_link,
        event_info: values.event_info,
        event_date: (new Date(date.value)).toISOString().split('T')[0],
      }
      const result = await useFetch('/api/site/event', { method: "POST", body: body })

      if (result.data?.value?.ok) {
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `Event has been created!`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })

        success.value = true
        setTimeout(() => {
          success.value = false
        }, 3000)
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

    // we can refresh the data from the server
    // this will update the initial values and the current avatar
    await refresh()

    resetForm()

    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  },
  (error) => {
    // this callback is optional and called only if the form has errors
    success.value = false

    // you can use it to scroll to the first error
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  },
)




// Handle update event
const isModalOpen = ref(false)
const updateEvent = reactive({
  eventId: '',
  eventTitle: '',
  eventDate: '',
  eventLink: '',
  eventInfo: '',
})

const handleUpdateEvent = async (eventId: string) => {
  const result = await useFetch('/api/site/event', { method: "GET", query: { eventId: eventId } })
  const event = result.data?.value?.event
  if (event) {
    updateEvent.eventId = eventId
    updateEvent.eventTitle = event.eventTitle
    updateEvent.eventDate = event.eventDate
    updateEvent.eventLink = event.eventLink
    updateEvent.eventInfo = event.eventInfo
    isModalOpen.value = true
  } else {
    toaster.clearAll()
    toaster.show({
      title: 'Oops!',
      message: 'Something went wrong',
      color: 'danger',
      icon: 'lucide:alert-triangle',
      closable: true,
    })
  }
}

const handleCloseModal = async () => {
  isModalOpen.value = false
  await refresh()
}

</script>

<template>
  <div>
    <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
      <BaseCard>
        <div class="flex items-center justify-between p-4">
          <div>
            <BaseHeading tag="h2" size="sm" weight="medium" lead="normal" class="uppercase tracking-wider">
              Event Schedule
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              Set event schedule
            </BaseText>
          </div>
          <div class="flex items-center gap-2">
            <BaseButton class="w-24" to="/dashboards/users">Cancel</BaseButton>
            <BaseButton type="submit" color="primary" class="w-24" :disabled="isSubmitting" :loading="isSubmitting">
              Save
            </BaseButton>
          </div>
        </div>
        <div class="p-4">
          <div class="mx-auto max-w-lg space-y-12 py-8">
            <BaseMessage v-if="success" @close="success = false">
              Event has been updated!
            </BaseMessage>
            <BaseMessage v-if="fieldsWithErrors" type="danger" @close="() => setErrors({})">
              This form has {{ fieldsWithErrors }} errors, please check them
              before submitting
            </BaseMessage>

            <TairoFormGroup label="Event List" sublabel="Add event content">
              <div v-if="!data?.events">
                <BasePlaceholderPage title="No event content" subtitle="Looks like you didn't add any event yet."
                  class="scale-90">
                  <template #image>
                    <img class="block dark:hidden" src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                      alt="Placeholder image" />
                    <img class="hidden dark:block"
                      src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg" alt="Placeholder image" />
                  </template>
                </BasePlaceholderPage>
              </div>
              <div v-else class="space-y-8">
                <div v-for="item in data?.events" :key="item?._id" class="flex w-full items-center gap-2">
                  <div class="flex items-center">
                    <div
                      class="bg-muted-100 dark:bg-muted-700/60 text-muted-400 flex h-[50px] w-[50px] items-center justify-center rounded-full">
                      <Icon name="flat-color-icons:planner" class="h-8 w-8" />
                    </div>
                    <div class="mx-2">
                      <BaseHeading tag="h3" size="sm" weight="medium">
                        {{ item?.eventTitle }}
                      </BaseHeading>
                      <BaseParagraph size="xs" class="text-muted-400">
                        <span>{{ item?.eventDate }}</span>
                      </BaseParagraph>
                    </div>
                  </div>
                  <div class="ms-auto">
                    <BaseDropdown flavor="context" label="Dropdown" orientation="end" condensed class="z-20"
                      shape="curved">
                      <BaseDropdownDivide />
                      <BaseDropdownItem @click="handleUpdateEvent(item?._id)" title="Edit" text="Edit this event">
                        <template #start>
                          <Icon name="ph:pencil-duotone" class="me-2 block h-5 w-5" />
                        </template>
                      </BaseDropdownItem>
                      <BaseDropdownItem @click="handleDeleteEvent(item?._id)" title="Delete" text="Delete this event">
                        <template #start>
                          <Icon name="ph:trash-duotone" class="me-2 block h-5 w-5" />
                        </template>
                      </BaseDropdownItem>
                    </BaseDropdown>
                  </div>
                </div>
              </div>
              <div class="border-muted-200 dark:border-muted-700 mt-8 flex w-full items-center gap-2 border-t pt-8">
                <div
                  class="bg-muted-100 dark:bg-muted-700/60 text-muted-400 flex h-[50px] w-[50px] items-center justify-center rounded-full">
                  <Icon name="ph:sparkle-duotone" class="h-5 w-5" />
                </div>
                <div>
                  <BaseHeading tag="h3" size="sm" weight="medium">
                    New Event
                  </BaseHeading>
                  <BaseParagraph size="xs" class="text-muted-400">
                    <span>Add a new event content</span>
                  </BaseParagraph>
                </div>
                <div class="ms-auto">
                  <BaseButtonIcon type="submit" shape="full" condensed>
                    <Icon name="lucide:plus" class="h-4 w-4" />
                  </BaseButtonIcon>
                </div>
              </div>

              <div class="grid grid-cols-12 gap-4 mt-3 p-4">
                <div class="col-span-12">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="event_title">
                    <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" type="text"
                      icon="ph:subtitles-duotone" label="Event Title" placeholder="Event Title"
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
                    <BaseTextarea :model-value="field.value" :error="errorMessage" :disabled="isSubmitting"
                      label="Event Info" shape="rounded" placeholder="Write event info..."
                      @update:model-value="handleChange" @blur="handleBlur" />
                  </Field>
                </div>
                <div class="col-span-12">
                  <DatePicker v-model="date" :masks="masks" :min-date="new Date()" mode="date" hide-time-header
                    trim-weeks>
                    <template #default="{ inputValue, inputEvents }">
                      <div class="flex w-full flex-col gap-4 sm:flex-row">
                        <div class="relative grow">
                          <Field v-slot="{
                            field,
                            errorMessage,
                            handleChange,
                            handleBlur,
                          }" name="event_date">
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
            </TairoFormGroup>
          </div>
        </div>
      </BaseCard>
      <TairoFormSave :disabled="isSubmitting" :loading="isSubmitting" @reset="resetForm" />
    </form>

    <EventUpdateModal :isModalOpen="isModalOpen" :updateEvent="updateEvent" @closeModal="handleCloseModal"
      v-if="isModalOpen" />
  </div>
</template>
