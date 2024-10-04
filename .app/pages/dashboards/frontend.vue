<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';
import { z } from 'zod';

definePageMeta({
  title: 'Frontend Website Content',
  preview: {
    title: 'Edit Website Content',
    description: 'For editing a Website Content',
    categories: ['users', 'edit', 'forms'],
    src: '/img/screens/layouts-subpages-profile-edit-1.png',
    srcDark: '/img/screens/layouts-subpages-profile-edit-1-dark.png',
    order: 76,
  },
})

// This is the object that will contain the validation messages
const VALIDATION_TEXT = {
  TITLE_REQUIRED: "Frontend website header title can't be empty",
  REST_PASS_REQUIRED: "Reset password message can't be empty",
  VERIFY_PASS_REQUIRED: "Verify password message can't be empty",
  CHANGE_PASS_REQUIRED: "Change password message can't be empty",
  TWOFACTOR_ENABLE_REQUIRED: "Twofactor enable message can't be empty",
  TWOFACTOR_DISABLE_REQUIRED: "Twofactor disable message can't be empty",
  credential_warning_REQUIRED: "Credential Warning message can't be empty",
  code_expired_REQUIRED: "Code expired message can't be empty",
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    site_title: z.string().min(1, VALIDATION_TEXT.TITLE_REQUIRED),
    reset_pass: z.string().min(1, VALIDATION_TEXT.REST_PASS_REQUIRED),
    verify_pass: z.string().min(1, VALIDATION_TEXT.VERIFY_PASS_REQUIRED),
    change_pass: z.string().min(1, VALIDATION_TEXT.CHANGE_PASS_REQUIRED),
    twofactor_enable: z.string().min(1, VALIDATION_TEXT.TWOFACTOR_ENABLE_REQUIRED),
    twofactor_disable: z.string().min(1, VALIDATION_TEXT.TWOFACTOR_DISABLE_REQUIRED),
    credential_warning: z.string().min(1, VALIDATION_TEXT.credential_warning_REQUIRED),
    code_expired: z.string().min(1, VALIDATION_TEXT.code_expired_REQUIRED),
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const { data, pending, error, refresh } = await useFetch(`/api/site/settings`)

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  site_title: data?.value?.site_title || '',
  reset_pass: data?.value?.reset_pass || '',
  verify_pass: data?.value?.verify_pass || '',
  change_pass: data?.value?.change_pass || '',
  twofactor_enable: data?.value?.twofactor_enable || '',
  twofactor_disable: data?.value?.twofactor_disable || '',
  credential_warning: data?.value?.credential_warning || '',
  code_expired: data?.value?.code_expired || '',
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

// Ask the user for confirmation before leaving the page if the form has unsaved changes
onBeforeRouteLeave(() => {
  if (meta.value.dirty) {
    return confirm('You have unsaved changes. Are you sure you want to leave?')
  }
})

const toaster = useToaster()
const router = useRouter()

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    try {
      const body = {
        id: data?.value?._id,
        site_title: values.site_title,
        reset_pass: values.reset_pass,
        verify_pass: values.verify_pass,
        change_pass: values.change_pass,
        twofactor_enable: values.twofactor_enable,
        twofactor_disable: values.twofactor_disable,
        credential_warning: values.credential_warning,
        code_expired: values.code_expired,
      }
      const result = await useFetch('/api/site/settings', { method: "POST", body: body })

      if (result.data?.value?.ok) {
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: result.data?.value?.message || `User profile has been updated!`,
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
</script>

<template>
  <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
    <BaseCard>
      <div class="flex items-center justify-between p-4">
        <div>
          <BaseHeading tag="h2" size="sm" weight="medium" lead="normal" class="uppercase tracking-wider">
            Frontend Content Settings
          </BaseHeading>
          <BaseText size="xs" class="text-muted-400">
            Set frontend website content
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
            Frontend site content has been updated!
          </BaseMessage>
          <BaseMessage v-if="fieldsWithErrors" type="danger" @close="() => setErrors({})">
            This form has {{ fieldsWithErrors }} errors, please check them
            before submitting
          </BaseMessage>

          <TairoFormGroup label="Frontend Content" sublabel="Set site global content">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="site_title">
                  <BaseInput :model-value="field.value" shape="curved" :error="errorMessage" :disabled="isSubmitting"
                    type="text" label="Frontend Header Title" icon="mdi:note-edit-outline"
                    placeholder="Frontend site title" @update:model-value="handleChange" @blur="handleBlur" />
                </Field>
              </div>
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="reset_pass">
                  <BaseTextarea label="Reset Password Notification" shape="curved"
                    placeholder="..." rows="2" :model-value="field.value"
                    :error="errorMessage" :disabled="isSubmitting" @update:model-value="handleChange"
                    @blur="handleBlur" />
                </Field>
              </div>
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="verify_pass">
                  <BaseTextarea label="Verify Password Notification" shape="curved"
                    placeholder="..." rows="2" :model-value="field.value"
                    :error="errorMessage" :disabled="isSubmitting" @update:model-value="handleChange"
                    @blur="handleBlur" />
                </Field>
              </div>
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="change_pass">
                  <BaseTextarea label="Change Password Notification" shape="curved"
                    placeholder="..." rows="2" :model-value="field.value"
                    :error="errorMessage" :disabled="isSubmitting" @update:model-value="handleChange"
                    @blur="handleBlur" />
                </Field>
              </div>
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="twofactor_enable">
                  <BaseTextarea label="Twofactor Enable Notification" shape="curved"
                    placeholder="..." rows="2" :model-value="field.value"
                    :error="errorMessage" :disabled="isSubmitting" @update:model-value="handleChange"
                    @blur="handleBlur" />
                </Field>
              </div>
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="twofactor_disable">
                  <BaseTextarea label="Twofactor Disable Notification" shape="curved"
                    placeholder="..." rows="2" :model-value="field.value"
                    :error="errorMessage" :disabled="isSubmitting" @update:model-value="handleChange"
                    @blur="handleBlur" />
                </Field>
              </div>
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="credential_warning">
                  <BaseTextarea label="Credential Warning Notification" shape="curved"
                    placeholder="..." rows="2" :model-value="field.value"
                    :error="errorMessage" :disabled="isSubmitting" @update:model-value="handleChange"
                    @blur="handleBlur" />
                </Field>
              </div>
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="code_expired">
                  <BaseTextarea label="Code Expired Notification" shape="curved"
                    placeholder="..." rows="2" :model-value="field.value"
                    :error="errorMessage" :disabled="isSubmitting" @update:model-value="handleChange"
                    @blur="handleBlur" />
                </Field>
              </div>
            </div>
          </TairoFormGroup>
        </div>
      </div>
    </BaseCard>
    <TairoFormSave :disabled="isSubmitting" :loading="isSubmitting" @reset="resetForm" />
  </form>
</template>
