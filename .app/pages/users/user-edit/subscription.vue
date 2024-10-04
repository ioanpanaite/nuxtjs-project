<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';
import { z } from 'zod';

definePageMeta({
  title: 'Subscription',
  preview: {
    title: 'Add Subscription',
    description: 'For editing a user subscription',
    categories: ['user', 'subscription', 'forms'],
    src: '/img/screens/layouts-subpages-profile-edit-2.png',
    srcDark: '/img/screens/layouts-subpages-profile-edit-2-dark.png',
    order: 77,
  },
})

const toaster = useToaster()
const router = useRouter()
const route = useRoute()
const query = computed(() => {
  return {
    id: route.query.user
  }
})

const { data, pending, error, refresh } = await useFetch('/api/payment/initial', { query })

const zodSchema = z
  .object({
    membership: z.string(),
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>


const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  membership: data?.value?.lookupKey || '',
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
// onBeforeRouteLeave(() => {
//   if (meta.value.dirty) {
//     return confirm('You have unsaved changes. Are you sure you want to leave?')
//   }
// })

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values) => {
    success.value = false

    try {
      const data = { ...values, userId: route.query.user }
      const result = await useFetch('/api/payment/checkout', { method: "POST", body: data })

      if (result.data?.value?.ok) {
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: result.data?.value?.message || `User subscription has been updated!`,
          color: 'success',
          icon: 'ph:check',
          closable: true,
        })

        success.value = true
        setTimeout(() => {
          success.value = false
        }, 1000)

        const info = result.data?.value?.info
        if (info?.url) {
          await navigateTo(info?.url, {
            external: true
          })
        }
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

// Handle to cancel user's subscription
const handleCancelMember = async () => {
  console.log('cancel member')
  try {
    const data = { userId: route.query.user }
    const result = await useFetch('/api/payment/cancel', { method: "POST", body: data })

    if (result.data?.value?.ok) {
      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: result.data?.value?.message || `User subscription has been canceled!`,
        color: 'success',
        icon: 'ph:check',
        closable: true,
      })
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
    resetForm();
  } catch (error: any) {
    toaster.clearAll()
    toaster.show({
      title: 'Oops!',
      message: 'Something went wrong',
      color: 'danger',
      icon: 'lucide:alert-triangle',
      closable: true,
    })
    return
  }
}

</script>

<template>
  <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
    <BaseCard>
      <div class="flex items-center justify-between p-4">
        <div>
          <BaseHeading tag="h2" size="sm" weight="medium" lead="normal" class="uppercase tracking-wider">
            Subscription
          </BaseHeading>
          <BaseText size="xs" class="text-muted-400">
            Edit your subscription info
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
            User subscription has been updated!
          </BaseMessage>
          <BaseMessage v-if="fieldsWithErrors" type="danger" @close="() => setErrors({})">
            This form has {{ fieldsWithErrors }} errors, please check them
            before submitting
          </BaseMessage>
          <fieldset class="w-full space-y-6">
            <div class="border-muted-200 dark:border-muted-700 flex items-center justify-between border-b py-4">
              <legend class="text-muted-800 dark:text-muted-100 font-sans text-xl font-medium">
                Change Plan
              </legend>

              <BaseButton @click="handleCancelMember" color="danger" shadow="flat">
                Cancel user plan
              </BaseButton>
            </div>

            <div class="grid gap-6 sm:grid-cols-2">
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="membership">
                <BaseRadioHeadless v-for="price in data?.prices" :key="price.id" :model-value="field.value"
                  :value="price.lookup_key" :disabled="isSubmitting" @update:model-value="handleChange"
                  @blur="handleBlur">
                  <BaseCard shape="curved"
                    class="peer-checked:!border-success-500 peer-checked:!bg-success-500/10 relative border-2 p-5 peer-checked:[&_.child]:!opacity-100">
                    <div class="flex flex-col">
                      <h4
                        class="text-muted-500 dark:text-muted-200 mb-3 font-sans text-sm font-medium uppercase leading-tight">
                        {{ price?.product?.name || '' }}
                      </h4>

                      <div class="font-sans">
                        <span class="text-muted-800 dark:text-muted-100 text-xl font-bold">
                          {{ price?.currency === "gbp" ? '£' : '$' }}
                          {{ price?.unit_amount ? price?.unit_amount / 100 : 0 }}
                        </span>

                        <span class="text-muted-500 dark:text-muted-400 text-sm font-medium">/month</span>
                      </div>
                    </div>

                    <div class="child absolute end-2 top-3 opacity-0">
                      <Icon name="ph:check-circle-duotone" class="text-success-500 h-7 w-7" />
                    </div>
                  </BaseCard>
                </BaseRadioHeadless>
              </Field>
            </div>
          </fieldset>
        </div>
      </div>
    </BaseCard>
    <TairoFormSave :disabled="isSubmitting" :loading="isSubmitting" @reset="resetForm" />
  </form>
</template>
