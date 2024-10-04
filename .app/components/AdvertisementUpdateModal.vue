<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';
import { ref } from 'vue';
import { z } from 'zod';

const props = defineProps<{
  isModalOpen?: boolean,
  updateAdvertise: any,
  eventId: string
}>()

const VALIDATION_TEXT = {
  TITLE_REQUIRED: "Title can't be empty",
  LINK_REQUIRED: "Link can't be empty",
}

const udpateSchema = z
  .object({
    update_title: z.string().min(1, VALIDATION_TEXT.TITLE_REQUIRED),
    update_link: z.string().min(1, VALIDATION_TEXT.LINK_REQUIRED),
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type UpdateFormInput = z.infer<typeof udpateSchema>

const validationSchema = toTypedSchema(udpateSchema)
const initialValues = computed<UpdateFormInput>(() => ({
  update_title: props.updateAdvertise.title || '',
  update_link: props.updateAdvertise.link || '',
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

const uploadedFiles = ref<FileList | null>(null)
const fileProgress = ref(0)
const uploadedImage = ref('')
const uploadProcess = ref(false)

const toaster = useToaster()
const onUpdate = handleUpdateSubmit(
  async (values) => {
    try {
      const body = {
        id: props.updateAdvertise.id,
        title: values.update_title,
        link: values.update_link,
        image: uploadedImage.value,
      }

      const result = await useFetch('/api/site/advertise', { method: "PUT", body: body })

      if (result.data?.value?.ok) {
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `Advertisement has been updated!`,
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

const fileUpload = async () => {
  const uploadFileSet = uploadedFiles.value;
  uploadProcess.value = true;

  if (uploadFileSet && uploadFileSet?.length > 0) {
    const appendFile = uploadFileSet[0] as Blob;

    const formData = new FormData();
    formData.append('image', appendFile)
    const result = await useFetch('/api/site/advertise/file', {
      method: "POST",
      body: formData
    })

    uploadProcess.value = false;

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
    uploadProcess.value = false;
    return false
  }
}


// Modal management
const isModal = computed(() => props.isModalOpen)
const emit = defineEmits(['closeModal'])
const handleCloseModal = () => {
  emit('closeModal')
}

const previewImage = (file: File) => {
  return URL.createObjectURL(file)
}

const previewFiles = () => {
  setTimeout(() => {
    fileUpload()
  }, 800);
}

</script>

<template>
  <!-- Modal component -->
  <TairoModal :open="isModal" size="lg" @close="handleCloseModal">
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
      <div class="mx-auto w-full max-w-lg">
        <form method="POST" action="" class="w-full pb-10" @submit.prevent="onUpdate">
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 sm:col-span-6">
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="update_title">
                <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" type="text"
                  icon="ph:subtitles-duotone" label="Title" placeholder="Display Text"
                  @update:model-value="handleChange" @blur="handleBlur" />
              </Field>
            </div>
            <div class="col-span-12 sm:col-span-6">
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="update_link">
                <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" type="text"
                  icon="tabler:external-link" label="Link" placeholder="Website URL" @update:model-value="handleChange"
                  @blur="handleBlur" />
              </Field>
            </div>
            <div class="col-span-12">
              <BaseFullscreenDropfile icon="ph:image-duotone"
                :filter-file-dropped="(file: File) => file.type.startsWith('image')"
                @drop="(value: FileList) => { uploadedFiles = value }" />
              <BaseInputFileHeadless accept="image/*" v-model="uploadedFiles"
                v-slot="{ open, remove, preview, drop, files }" @change="previewFiles">
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
                              src="/img/avatars/placeholder-file.png" alt="Image preview placeholder" />
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

          <div class="mx-auto pt-4 w-full flex justify-center">
            <BaseButton type="submit" color="primary" flavor="solid" :disabled="uploadProcess">
              Update
            </BaseButton>
          </div>
        </form>
      </div>
      <TairoFormSave :disabled="isUpdateSubmitting" :loading="isUpdateSubmitting" @reset="updateResetForm" />
    </div>

  </TairoModal>
</template>
