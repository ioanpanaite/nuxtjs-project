<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';
import { z } from 'zod';
import { countries } from '~/lib/countries';
import { currency } from '~/lib/constant';

definePageMeta({
  title: 'Edit User Profile',
  preview: {
    title: 'Edit User profile',
    description: 'For editing a user profile',
    categories: ['users', 'edit', 'forms'],
    src: '/img/screens/layouts-subpages-profile-edit-1.png',
    srcDark: '/img/screens/layouts-subpages-profile-edit-1-dark.png',
    order: 76,
  },
})

// This is the object that will contain the validation messages
const ONE_MB = 1000000
const VALIDATION_TEXT = {
  FULL_REQUIRED: "User full name can't be empty",
  USERNAME_REQUIRED: "User account username can't be empty",
  OPTION_REQUIRED: 'Please select an option',
  AVATAR_TOO_BIG: `Avatar size must be less than 1MB`,
  NEW_PASSWORD_LENGTH: 'Password must be at least 8 characters',
  NEW_PASSWORD_MATCH: 'Passwords do not match',
  EMAIL_REQUIRED: 'User email must be set.',
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    // avatar: z.custom<File>((v) => v instanceof File).nullable(),
    fullname: z.string().min(1, VALIDATION_TEXT.FULL_REQUIRED),
    username: z.string().min(1, VALIDATION_TEXT.USERNAME_REQUIRED),
    email: z.string().min(5, VALIDATION_TEXT.EMAIL_REQUIRED),
    loginType: z.string(),
    status: z.string(),
    country: z.string(),
    crypto: z.string(),
    promoCode: z.string(),
    telegram: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    // This is a custom validation function that will be called
    // before the form is submitted
    if (!data.status) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.OPTION_REQUIRED,
        path: ['status'],
      })
    }

    if (data.newPassword) {
      if (data.newPassword.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION_TEXT.NEW_PASSWORD_LENGTH,
          path: ['newPassword'],
        })
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION_TEXT.NEW_PASSWORD_MATCH,
          path: ['confirmPassword'],
        })
      }
    }

    // if (data.avatar && data.avatar.size > ONE_MB) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: VALIDATION_TEXT.AVATAR_TOO_BIG,
    //     path: ['avatar'],
    //   })
    // }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const route = useRoute()
const query = computed(() => {
  return {
    id: route.query.user
  }
})
const { data, pending, error, refresh } = await useFetch(`/api/user`, { query })

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  // avatar: null,
  fullname: data?.value?.fullname || '',
  username: data?.value?.username || '',
  email: data?.value?.email || '',
  emailVerified: data?.value?.emailVerified,
  twofactorEnabled: data?.value?.twofactorEnabled,
  loginType: data?.value?.loginType,
  status: data?.value?.status,
  country: data?.value?.country,
  crypto: data?.value?.crypto,
  promoCode: data?.value?.promoCode || '',
  telegram: data?.value?.telegram || '',
  newPassword: '',
  confirmPassword: '',
}))

// Password show
const showPasswordField = ref(false)
const showConfimPasswordField = ref(false)

// This is the computed value that will be used to display the current avatar
// const currentAvatar = computed(() => data.value.image)

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

// BaseInputFileHeadless gives us a listfile input, but we need to
// extract the file from the list and set it to the form
// const inputFile = ref<FileList | null>(null)
// const fileError = useFieldError('avatar')
// watch(inputFile, (value) => {
//   const file = value?.item(0) || null
//   setFieldValue('avatar', file)
// })

// Ask the user for confirmation before leaving the page if the form has unsaved changes
onBeforeRouteLeave(() => {
  if (meta.value.dirty) {
    return confirm('You have unsaved changes. Are you sure you want to leave?')
  }
})

const toaster = useToaster()
const router = useRouter()

const handleDeleteUser = async () => {
  const result = await useFetch(`/api/user/remove`, { method: "DELETE", body: { userId: route.query.user } })
  if (result.data.value?.ok) {
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `User deleted permanantely!`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })

    router.push('/dashboards/users')
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

const switchValues = reactive({
  emailVerified: false,
  twofactorEnabled: false
})


// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    try {
      const data = { ...values, emailVerified: switchValues.emailVerified, twofactorEnabled: switchValues.twofactorEnabled, userId: route.query.user }
      const result = await useFetch('/api/user/edit', { method: "PUT", body: data })

      if (result.data?.value?.ok) {
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `User profile has been updated!`,
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

    // resetForm()

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
            User info
          </BaseHeading>
          <BaseText size="xs" class="text-muted-400">
            Edit your account's general information
          </BaseText>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton class="w-24" to="/dashboards/users">Cancel</BaseButton>
          <BaseButton type="submit" color="primary" class="w-24" :disabled="isSubmitting" :loading="isSubmitting">Save
          </BaseButton>
        </div>
      </div>
      <div class="p-4">
        <div class="mx-auto max-w-lg space-y-12 py-8">
          <BaseMessage v-if="success" @close="success = false">
            User profile has been updated!
          </BaseMessage>
          <BaseMessage v-if="fieldsWithErrors" type="danger" @close="() => setErrors({})">
            This form has {{ fieldsWithErrors }} errors, please check them
            before submitting
          </BaseMessage>

          <!-- <TairoFormGroup label="Profile picture" sublabel="This is how others will recognize you">
            <div class="relative flex flex-col items-center justify-center gap-4">
              <BaseFullscreenDropfile icon="ph:image-duotone"
                :filter-file-dropped="(file) => file.type.startsWith('image')" @drop="(value) => {
                  inputFile = value
                }
                  " />
              <BaseInputFileHeadless accept="image/*" v-model="inputFile" v-slot="{ open, remove, preview, files }">
                <div class="relative h-24 w-24">
                  <img v-if="files?.length && files.item(0)" :src="preview(files.item(0)!).value" alt="Upload preview"
                    class="bg-muted-200 dark:bg-muted-700/60 h-24 w-24 rounded-full object-cover object-center" />
                  <img v-else :src="currentAvatar" alt="Upload preview"
                    class="bg-muted-200 dark:bg-muted-700/60 h-24 w-24 rounded-full object-cover object-center" />
                  <div v-if="files?.length && files.item(0)" class="absolute bottom-0 end-0 z-20">
                    <BaseButtonIcon condensed shape="full" @click="remove(files.item(0)!)" data-tooltip="Remove image">
                      <Icon name="lucide:x" class="h-4 w-4" />
                    </BaseButtonIcon>
                  </div>
                  <div v-else class="absolute bottom-0 end-0 z-20">
                    <div class="relative" data-tooltip="Upload image">
                      <BaseButtonIcon condensed shape="full" @click="open">
                        <Icon name="lucide:plus" class="h-4 w-4" />
                      </BaseButtonIcon>
                    </div>
                  </div>
                </div>
              </BaseInputFileHeadless>
              <div v-if="fileError" class="text-danger-600 inline-block font-sans text-[.8rem]">
                {{ fileError }}
              </div>
            </div>
          </TairoFormGroup> -->

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
              <div class="col-span-12">
                <Field v-slot="{ field, handleChange, handleBlur }" name="emailVerified">
                  <BaseSwitchBall v-model="switchValues.emailVerified" :disabled="isSubmitting" label="Email Verified"
                    sublabel="Enable partner emails" color="primary"
                    @blur="handleBlur" />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="status">
                  <BaseSelect label="Account Status" icon="ph:circles-four-duotone" :model-value="field.value"
                    :error="errorMessage" :disabled="isSubmitting" @update:model-value="handleChange" @blur="handleBlur">
                    <option value="" hidden></option>
                    <option value="new">New</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="disabled">Disabled</option>
                    <option value="deleted">Deleted</option>
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
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="newPassword">
                  <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting"
                    :type="showPasswordField ? 'password' : 'text'" icon="ph:lock-duotone" placeholder="New password"
                    autocomplete="new-password" @update:model-value="handleChange" @blur="handleBlur">
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
                </Field>
              </div>
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="confirmPassword">
                  <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting"
                    :type="showConfimPasswordField ? 'password' : 'text'" icon="ph:lock-duotone"
                    placeholder="Repeat new password" @update:model-value="handleChange" @blur="handleBlur">
                    <template #action>
                      <button
                        class="leading-0 text-muted-400 peer-focus-within:text-primary-500 absolute end-0 top-0 flex h-10 w-10 items-center justify-center text-center text-xl"
                        @click.prevent="showConfimPasswordField = !showConfimPasswordField">
                        <div class="relative flex h-full w-full items-center justify-center"
                          :data-nui-tooltip="`${showConfimPasswordField ? 'Show' : 'Hide'} password`">
                          <Icon :name="showConfimPasswordField ? 'mdi:eye-outline' : 'mdi:eye-off-outline'"
                            class="h-5 w-5" />
                        </div>
                      </button>
                    </template>
                  </BaseInput>
                </Field>
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup label="2 Factor Auth" sublabel="Two factor authentication">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12">
                <Field v-slot="{ field, handleChange, handleBlur }" name="twofactorEnabled">
                  <BaseSwitchThin v-model="switchValues.twofactorEnabled" :disabled="isSubmitting" label="Enabled"
                    sublabel="Toggle 2 factor authentication" color="primary"
                    @blur="handleBlur" />
                </Field>
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup label="User info" sublabel="User onboarding registered information">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="country">
                  <BaseSelect label="User Country" icon="ph:globe-duotone" :model-value="field.value"
                    :error="errorMessage" :disabled="isSubmitting" @update:model-value="handleChange" @blur="handleBlur">
                    <option value="" hidden></option>
                    <option v-for="item in countries" :key="item.id" :value="item.id">{{ item.name }}</option>
                  </BaseSelect>
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="crypto">
                  <BaseSelect label="Cryptocurrency" icon="ph:wallet" :model-value="field.value" :error="errorMessage"
                    :disabled="isSubmitting" @update:model-value="handleChange" @blur="handleBlur">
                    <option value="" hidden></option>
                    <option v-for="item in currency" :key="item.id" :value="item.id">{{ item.name }}</option>
                  </BaseSelect>
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="promoCode">
                  <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" type="text"
                    icon="ph:suitcase-duotone" placeholder="Promo code" @update:model-value="handleChange"
                    @blur="handleBlur" />
                </Field>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="telegram">
                  <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" type="text"
                    icon="fa6-brands:telegram" placeholder="Telegram" @update:model-value="handleChange"
                    @blur="handleBlur" />
                </Field>
              </div>
            </div>
          </TairoFormGroup>

          <TairoFormGroup label="Delete User" sublabel="Warning! user will be deleted permanantely.">
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
