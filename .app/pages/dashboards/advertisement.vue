<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';
import { z } from 'zod';
import { ref } from 'vue'


definePageMeta({
  title: 'Advertisement',
  preview: {
    title: 'Advertisement management',
    description: 'For editing a Advertisement of frontend site',
    categories: ['advertisement', 'edit', 'forms'],
    src: '/img/screens/layouts-subpages-profile-edit-1.png',
    srcDark: '/img/screens/layouts-subpages-profile-edit-1-dark.png',
    order: 76,
  },
})

// This is the object that will contain the validation messages
const VALIDATION_TEXT = {
  TITLE_REQUIRED: "Title can't be empty",
  LINK_REQUIRED: "Link can't be empty",
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    advertise_title: z.string().min(1, VALIDATION_TEXT.TITLE_REQUIRED),
    advertise_link: z.string().min(1, VALIDATION_TEXT.LINK_REQUIRED),
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

// Ask the user for confirmation before leaving the page if the form has unsaved changes
onBeforeRouteLeave(() => {
  if (meta.value.dirty) {
    return confirm('You have unsaved changes. Are you sure you want to leave?')
  }
})

const toaster = useToaster()
const { data, pending, error, refresh } = await useFetch(`/api/site/advertise`)

const handleSortUp = async (advertiseId: string) => {
  const result = await useFetch('/api/site/advertise/sort', { method: "PUT", body: { advertiseId, toward: 'up' } })
  refresh()
}

const handleSortDown = async (advertiseId: string) => {
  const result = await useFetch('/api/site/advertise/sort', { method: "PUT", body: { advertiseId, toward: 'down' } })
  refresh()
}

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  advertise_title: '',
  advertise_link: ''
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

const uploadedFiles = ref<FileList | null>(null)
const fileProgress = ref(0)
const uploadedImage = ref('')

const fileUpload = async () => {
  const uploadFileSet = uploadedFiles.value;
  if (uploadFileSet && uploadFileSet?.length > 0) {
    const appendFile = uploadFileSet[0] as Blob;

    const formData = new FormData();
    formData.append('image', appendFile)
    const result = await useFetch('/api/site/advertise/file', {
      method: "POST",
      body: formData
    })

    if (result.data?.value?.ok) {
      fileProgress.value = 100
      const info = result.data?.value?.info
      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: `Image uploaded!`,
        color: 'success',
        icon: 'ph:check',
        closable: true,
      })
      uploadedImage.value = info?.image
      return info?.image
    } else {
      toaster.clearAll()
      toaster.show({
        title: 'Oops!',
        message: "Something went wrong.",
        color: 'danger',
        icon: 'lucide:alert-triangle',
        closable: true,
      })
      return false
    }
  } else {
    toaster.clearAll()
    toaster.show({
      title: 'Oops!',
      message: "Please select a file.",
      color: 'info',
      icon: 'lucide:alert-triangle',
      closable: true,
    })
    return false
  }
}

const handleDeleteAdvertise = async (advertiseId: string) => {
  const result = await useFetch(`/api/site/advertise`, { method: "DELETE", body: { advertiseId } })
  if (result.data.value?.ok) {
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: result.data.value?.message || `Advertisement deleted succesfully!`,
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
      if (!uploadedImage.value) {
        const uploadedFile = await fileUpload()
        if (!uploadedFile) {
          toaster.clearAll()
          toaster.show({
            title: 'Oops!',
            message: 'Something went wrong.',
            color: 'danger',
            icon: 'lucide:alert-triangle',
            closable: true,
          })
          return;
        }
      }

      const body = {
        advertise_title: values.advertise_title,
        advertise_link: values.advertise_link,
        advertise_image: uploadedImage.value
      }
      const result = await useFetch('/api/site/advertise', { method: "POST", body: body })

      if (result.data?.value?.ok) {
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `Advertisement has been created!`,
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
    uploadedFiles.value = null
    fileProgress.value = 0

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
const updateAdvertise = reactive({
  id: '',
  title: '',
  image: '',
  link: ''
})

const handleUpdateAdvertise = async (advertiseId: string) => {
  const result = await useFetch('/api/site/advertise/id', { method: "GET", query: { advertiseId } })
  const advertisement = result.data?.value?.advertisement
  if (advertisement) {
    updateAdvertise.id = advertiseId
    updateAdvertise.title = advertisement.title
    updateAdvertise.image = advertisement.image
    updateAdvertise.link = advertisement.link
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

const previewImage = (file: File) => {
  return URL.createObjectURL(file)
}

</script>

<template>
  <div>
    <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
      <BaseCard>
        <div class="flex items-center justify-between p-4">
          <div>
            <BaseHeading tag="h2" size="sm" weight="medium" lead="normal" class="uppercase tracking-wider">
              Advertisement
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              Set advertisement to show header of frontend
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
              Advertisement has been updated!
            </BaseMessage>
            <BaseMessage v-if="fieldsWithErrors" type="danger" @close="() => setErrors({})">
              This form has {{ fieldsWithErrors }} errors, please check them
              before submitting
            </BaseMessage>

            <TairoFormGroup label="Advertisement" sublabel="Add advertisement to show in header of frontend">
              <div v-if="!data.advertisement || data.advertisement.length === 0">
                <BasePlaceholderPage title="No advertisement" subtitle="Looks like you didn't add any advertisement yet."
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
                <div v-for="item in data.advertisement" :key="item?._id" class="flex w-full items-center gap-2">
                  <div class="flex items-center">
                    <img :src="item?.image" :alt="item?.title" class="h-14 w-14 rounded-xl object-cover object-center" />
                    <div class="mx-2">
                      <BaseHeading tag="h3" size="sm" weight="medium">
                        {{ item?.title }}
                      </BaseHeading>
                    </div>
                  </div>
                  <div class="flex ms-auto">
                    <div class="ms-auto flex items-center">
                      <button type="button"
                        class="nui-focus border-muted-200 mr-2 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        tooltip="Select files" @click="handleSortUp(item?._id)">
                        <Icon name="icons8:angle-up" class="h-4 w-4" />

                        <span class="sr-only">UpSort</span>
                      </button>
                      <button type="button"
                        class="nui-focus border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        tooltip="Select files" @click="handleSortDown(item?._id)">
                        <Icon name="icons8:angle-down" class="h-4 w-4" />

                        <span class="sr-only">DownSort</span>
                      </button>
                    </div>
                    <BaseDropdown flavor="context" label="Dropdown" orientation="end" condensed class="z-20 mx-2"
                      shape="curved">
                      <BaseDropdownDivide />
                      <BaseDropdownItem @click="handleUpdateAdvertise(item?._id)" title="Edit" text="Edit this ads">
                        <template #start>
                          <Icon name="ph:pencil-duotone" class="me-2 block h-5 w-5" />
                        </template>
                      </BaseDropdownItem>
                      <BaseDropdownItem @click="handleDeleteAdvertise(item?._id)" title="Delete" text="Delete this ads">
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
                    New advertisement
                  </BaseHeading>
                  <BaseParagraph size="xs" class="text-muted-400">
                    <span>Add a new advertisement</span>
                  </BaseParagraph>
                </div>
                <div class="ms-auto">
                  <BaseButtonIcon type="submit" shape="full" condensed>
                    <Icon name="lucide:plus" class="h-4 w-4" />
                  </BaseButtonIcon>
                </div>
              </div>

              <div class="grid grid-cols-12 gap-4 mt-3 p-4">
                <div class="col-span-12 sm:col-span-6">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="advertise_title">
                    <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" type="text"
                      icon="ph:subtitles-duotone" label="Title" placeholder="Display Text"
                      @update:model-value="handleChange" @blur="handleBlur" />
                  </Field>
                </div>
                <div class="col-span-12 sm:col-span-6">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="advertise_link">
                    <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" type="text"
                      icon="tabler:external-link" label="Link" placeholder="Website URL"
                      @update:model-value="handleChange" @blur="handleBlur" />
                  </Field>
                </div>
                <div class="col-span-12">
                  <BaseFullscreenDropfile icon="ph:image-duotone"
                    :filter-file-dropped="(file: File) => file.type.startsWith('image')"
                    @drop="(value: FileList) => { uploadedFiles = value }" />
                  <BaseInputFileHeadless accept="image/*" v-model="uploadedFiles"
                    v-slot="{ open, remove, preview, drop, files }">
                    <!-- Controls -->
                    <div class="mb-4 flex items-center gap-2">
                      <button type="button"
                        class="nui-focus border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        tooltip="Select files" @click="open">
                        <Icon name="lucide:plus" class="h-4 w-4" />

                        <span class="sr-only">Select image</span>
                      </button>

                      <button type="button" @click="fileUpload"
                        class="nui-focus border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                        tooltip="Start Upload">
                        <Icon name="lucide:arrow-up" class="h-4 w-4" />

                        <span class="sr-only">Start Upload</span>
                      </button>
                    </div>

                    <div class="" @dragenter.stop.prevent @dragover.stop.prevent @drop="drop">
                      <div v-if="!uploadedFiles?.length"
                        class="nui-focus border-muted-300 dark:border-muted-700 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed p-8 transition-colors duration-300"
                        tabindex="0" role="button" @click="open" @keydown.enter.prevent="open">
                        <div class="p-5 text-center">
                          <Icon name="mdi-light:cloud-upload"
                            class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-10 w-10 transition-colors duration-300" />

                          <h4 class="text-muted-400 font-sans text-sm">Drop image to upload</h4>

                          <div>
                            <span class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase">
                              Or
                            </span>
                          </div>

                          <label for="file"
                            class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300">
                            Select image
                          </label>
                        </div>
                      </div>

                      <ul v-else class="mt-6 space-y-2">
                        <li v-for="file in uploadedFiles" :key="file.name">
                          <div
                            class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-end gap-2 rounded-xl border bg-white p-3">
                            <div class="flex items-center gap-2">
                              <div class="shrink-0">
                                <img class="h-14 w-14 rounded-xl object-cover object-center"
                                  v-if="file.type.startsWith('image')" :src="previewImage(file)" alt="Image preview" />

                                <img v-else class="h-14 w-14 rounded-xl object-cover object-center"
                                  src="/img/avatars/placeholder-file.png" alt="Image preview" />
                              </div>

                              <div class="font-sans">
                                <span class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm">
                                  {{ file.name }}
                                </span>

                                <span class="text-muted-400 block text-xs">
                                  {{ formatFileSize(file.size) }}
                                </span>
                              </div>
                            </div>

                            <div class="ms-auto w-32 px-4 transition-opacity duration-300" :class="'opacity-100'">
                              <BaseProgress :value="fileProgress" size="xs" :color="'success'" />
                            </div>

                            <div class="flex gap-2">
                              <button
                                class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled type="button" tooltip="Cancel">
                                <Icon name="lucide:slash" class="h-4 w-4" />

                                <span class="sr-only">Cancel</span>
                              </button>

                              <button @click="fileUpload"
                                class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                type="button" tooltip="Upload">
                                <Icon name="lucide:arrow-up" class="h-4 w-4" />

                                <span class="sr-only">Upload</span>
                              </button>

                              <button
                                class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                                type="button" tooltip="Remove" @click.prevent="remove(file)">
                                <Icon name="lucide:x" class="h-4 w-4" />

                                <span class="sr-only">Remove</span>
                              </button>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </BaseInputFileHeadless>
                </div>
              </div>
            </TairoFormGroup>
          </div>
        </div>
      </BaseCard>
      <TairoFormSave :disabled="isSubmitting" :loading="isSubmitting" @reset="resetForm" />
    </form>

    <AdvertisementUpdateModal :isModalOpen="isModalOpen" :updateAdvertise="updateAdvertise" @closeModal="handleCloseModal"
      v-if="isModalOpen" />
  </div>
</template>
