<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';
import { z } from 'zod';

definePageMeta({
  title: 'Edit Admin Profile',
  preview: {
    title: 'Edit Admin profile',
    description: 'For editing a Admin profile',
    categories: ['core-users', 'edit', 'forms'],
    src: '/img/screens/layouts-subpages-profile-edit-1.png',
    srcDark: '/img/screens/layouts-subpages-profile-edit-1-dark.png',
    order: 76,
  },
})

// This is the object that will contain the validation messages
const ONE_MB = 1000000
const VALIDATION_TEXT = {
  FULLNAME_REQUIRED: "Admin full name can't be empty",
  USERNAME_REQUIRED: "Admin account username can't be empty",
  EMAIL_REQUIRED: 'Admin email must be set.',
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    fullname: z.string().min(1, VALIDATION_TEXT.FULLNAME_REQUIRED),
    username: z.string().min(1, VALIDATION_TEXT.USERNAME_REQUIRED),
    email: z.string().email(VALIDATION_TEXT.EMAIL_REQUIRED),
    status: z.string(),
    loginType: z.string(),
    twofactorEnabled: z.boolean(),
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const route = useRoute()
const { data, pending, error, refresh } = await useFetch(`/api/profile`)
const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  fullname: data?.value?.profile.fullname || '',
  username: data?.value?.profile.username || '',
  email: data?.value?.profile.email || '',
  status: data?.value?.profile.status,
  loginType: data?.value?.profile.loginType,
  twofactorEnabled: data?.value?.profile.twofactorEnabled,
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
const adminId = data?.value?.profile?._id

const handleDeleteUser = async () => {
  const result = await useFetch(`/api/admin/remove`, { method: "DELETE", body: { id: adminId } })
  if (result.data.value?.ok) {
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Admin deleted permanantely!`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })

    router.push('/core/administrators')
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

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    try {
      const data = { ...values, password: password.value, id: adminId }
      const result = await useFetch('/api/admin/edit', { method: "PUT", body: data })

      if (result.data?.value?.ok) {
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `Admin profile has been updated!`,
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
          message: result.data?.value?.message || "Something went wrong.",
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

// Password show
const showPasswordField = ref(true)
const password = ref('')

const newPassword = () => {
  const newPassword = generatePassword();
  password.value = newPassword
}

const { text, copy, copied, isSupported } = useClipboard({ source: password })
const handleClipboard = () => {
  copy(password.value)
}
</script>

<template>
  <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
    <BaseCard>
      <div class="flex items-center justify-between p-4">
        <div>
          <BaseHeading tag="h2" size="sm" weight="medium" lead="normal" class="uppercase tracking-wider">
            Admin info
          </BaseHeading>
          <BaseText size="xs" class="text-muted-400">
            Edit admin account's general information
          </BaseText>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton class="w-24" to="/core/administrators">Cancel</BaseButton>
          <BaseButton type="submit" color="primary" class="w-24" :disabled="isSubmitting" :loading="isSubmitting">Save
          </BaseButton>
        </div>
      </div>
      <div class="p-4">
        <div class="mx-auto max-w-lg space-y-12 py-8">
          <BaseMessage v-if="success" @close="success = false">
            Admin profile has been updated!
          </BaseMessage>
          <BaseMessage v-if="fieldsWithErrors" type="danger" @close="() => setErrors({})">
            This form has {{ fieldsWithErrors }} errors, please check them
            before submitting
          </BaseMessage>

          <TairoFormGroup label="User Info" sublabel="Others diserve to know you more">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="fullname">
                  <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" type="text"
                    icon="ph:user-duotone" placeholder="Full name" @update:model-value="handleChange"
                    @blur="handleBlur" />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="username">
                  <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" type="text"
                    icon="ph:user-duotone" placeholder="Account User name" @update:model-value="handleChange"
                    @blur="handleBlur" />
                </Field>
              </div>
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="email">
                  <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" type="text"
                    icon="ph:envelope-duotone" placeholder="Email" @update:model-value="handleChange"
                    @blur="handleBlur" />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="status">
                  <BaseSelect label="Account Status" icon="ph:circles-four-duotone" :model-value="field.value"
                    :error="errorMessage" :disabled="isSubmitting" @update:model-value="handleChange" @blur="handleBlur">
                    <option value="" hidden></option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="disabled">Disabled</option>
                  </BaseSelect>
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="loginType">
                  <BaseSelect label="Login With" icon="ph:circles-four-duotone" :model-value="field.value"
                    :error="errorMessage" :disabled="isSubmitting" @update:model-value="handleChange" @blur="handleBlur">
                    <option value="" hidden></option>
                    <option value="credential">Credential</option>
                    <option value="google">Google</option>
                  </BaseSelect>
                </Field>
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup label="Change Password" sublabel="For an improved account security">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 sm:col-span-8">
                <BaseInput v-model="password" :disabled="isSubmitting" :type="showPasswordField ? 'password' : 'text'"
                  icon="ph:lock-duotone" placeholder="New password" autocomplete="new-password">
                  <template #action>
                    <button
                      class="leading-0 text-muted-400 peer-focus-within:text-primary-500 absolute end-0 top-0 flex h-10 w-10 items-center justify-center text-center text-xl"
                      @click.prevent="showPasswordField = !showPasswordField">
                      <div class="relative flex h-full w-full items-center justify-center"
                        :data-nui-tooltip="`${showPasswordField ? 'Show' : 'Hide'} password`">
                        <Icon :name="showPasswordField ? 'mdi:eye-outline' : 'mdi:eye-off-outline'" class="h-5 w-5" />
                      </div>
                    </button>
                  </template>
                </BaseInput>
              </div>
              <div class="col-span-12 sm:col-span-4">
                <div class="grid grid-cols-12 gap-4">
                  <div class="col-span-4">
                    <BaseButton shape="curved" @click="handleClipboard">
                      <Icon name="ph:cards-duotone" class="h-4 w-4" />
                    </BaseButton>
                  </div>
                  <div class="col-span-8">
                    <BaseButton color="primary" shape="curved" @click="newPassword()">
                      <Icon name="ph:arrows-clockwise" class="h-4 w-4" />
                      <span>New</span>
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </TairoFormGroup>

          <!-- <TairoFormGroup label="2 Factor Auth" sublabel="Two factor authentication">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12">
                <Field v-slot="{ field, handleChange, handleBlur }" name="twofactorEnabled">
                  <BaseSwitchThin :model-value="field.value" :disabled="isSubmitting" label="Enabled"
                    sublabel="Toggle 2 factor authentication" color="primary" @update:model-value="handleChange"
                    @blur="handleBlur" />
                </Field>
              </div>
            </div>
          </TairoFormGroup> -->

          <TairoFormGroup label="Delete Admin" sublabel="Warning! Admin will be deleted permanantely.">
            <div class="grid grid-cols-12">
              <div class="col-span-12">
                <BaseButton @click="handleDeleteUser" class="w-full" color="danger" shadow="flat">Delete</BaseButton>
              </div>
            </div>
          </TairoFormGroup>
        </div>
      </div>
    </BaseCard>
    <TairoFormSave :disabled="isSubmitting" :loading="isSubmitting" @reset="resetForm" />
  </form>
</template>
