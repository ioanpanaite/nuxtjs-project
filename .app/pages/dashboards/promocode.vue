<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { DatePicker } from 'v-calendar';
import { Field, useForm } from 'vee-validate';
import { ref } from 'vue';
import { z } from 'zod';

import 'v-calendar/dist/style.css';
import '~/assets/css/vcalendar.css';

definePageMeta({
  title: 'Promotion',
  preview: {
    title: 'Code management',
    description: 'For editing a evenet schedule',
    categories: ['promotion', 'code', 'forms'],
    src: '/img/screens/layouts-subpages-profile-edit-1.png',
    srcDark: '/img/screens/layouts-subpages-profile-edit-1-dark.png',
    order: 76,
  },
})

interface PromoCode {
  promoCode: string
  promoDescription: string
  promoDiscount: number
  promoExpiry: string,
  promoPeriod: string
}

// This is the object that will contain the validation messages
const VALIDATION_TEXT = {
  CODE_REQUIRED: "Promo code can't be empty",
  DISCOUNT_NUMBER_REQUIRED: "Promocode must be number",
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    promoCode: z.string().min(1, VALIDATION_TEXT.CODE_REQUIRED),
    promoDescription: z.string(),
    promoDiscount: z.string(),
    promoExpiry: z.date().nullable(),
    promoPeriod: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.promoDiscount) {
      const discount = Number(data.promoDiscount)
      if (isNaN(discount)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION_TEXT.DISCOUNT_NUMBER_REQUIRED,
          path: ['promoDiscount'],
        })
      }
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const { data, pending, error, refresh } = await useFetch(`/api/promocode/list`)

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  promoCode: '',
  promoDescription: '',
  promoDiscount: '',
  promoExpiry: null,
  promoPeriod: '1week',
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
const date = ref(new Date())
const masks = ref({
  input: 'YYYY-MM-DD',
})

const handleDeleteCode = async (codeId: string) => {
  const result = await useFetch(`/api/promocode/promo`, { method: "DELETE", body: { codeId } })
  if (result.data.value?.ok) {
    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: result.data.value?.message || `Promo code deleted succesfully!`,
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
        promoCode: values.promoCode,
        promoDescription: values.promoDescription,
        promoDiscount: Number(values.promoDiscount),
        promoExpiry: (new Date(date.value)).toISOString().split('T')[0],
        promoPeriod: values.promoPeriod,
      }
      const result = await useFetch('/api/promocode/add', { method: "POST", body: body })

      if (result.data?.value?.ok) {
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `Promo Code has been created!`,
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

const newPromoCode = () => {
  const newPromoCode = generatePromoCode();
  setFieldValue("promoCode", newPromoCode)
}

// Handle update event
const isModalOpen = ref(false)
const updateCode = reactive({
  codeId: '',
  promoCode: '',
  promoDescription: '',
  promoDiscount: 0,
  promoExpiry: '',
  promoPeriod: '',
})

const handleUpdateCode = async (codeId: string) => {
  const result = await useFetch('/api/promocode/code', { method: "GET", query: { codeId } })
  const code = result.data?.value?.code as PromoCode

  if (code) {
    updateCode.codeId = codeId
    updateCode.promoCode = code.promoCode
    updateCode.promoDescription = code.promoDescription
    updateCode.promoDiscount = code.promoDiscount
    updateCode.promoExpiry = code.promoExpiry
    updateCode.promoPeriod = code.promoPeriod
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
              Promotion Code
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              Set promotion code
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
              Code has been updated!
            </BaseMessage>
            <BaseMessage v-if="fieldsWithErrors" type="danger" @close="() => setErrors({})">
              This form has {{ fieldsWithErrors }} errors, please check them
              before submitting
            </BaseMessage>

            <TairoFormGroup label="Promo Code List" sublabel="Add promo code">
              <div v-if="!data?.codes || data?.codes.length === 0">
                <BasePlaceholderPage title="No promo codes" subtitle="Looks like you didn't add any promo code yet."
                  class="scale-90">
                  <template #image>
                    <img class="block dark:hidden" src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                      alt="Placeholder image" />
                    <img class="hidden dark:block"
                      src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                      alt="Placeholder image" />
                  </template>
                </BasePlaceholderPage>
              </div>
              <div v-else class="space-y-8">
                <div v-for="item in  data?.codes " :key="item?._id" class="flex w-full items-center gap-2">
                  <div class="flex items-center">
                    <div
                      class="bg-muted-100 dark:bg-muted-700/60 text-muted-400 flex h-[50px] w-[50px] items-center justify-center rounded-full">
                      <Icon name="flat-color-icons:collaboration" class="h-8 w-8" />
                    </div>
                    <div class="mx-2">
                      <BaseHeading tag="h3" size="sm" weight="medium">
                        {{ item?.promoCode }}
                      </BaseHeading>
                      <BaseParagraph size="xs" class="text-muted-400">
                        <span>{{ item?.promoDescription }}</span>
                      </BaseParagraph>
                    </div>
                  </div>
                  <div class="ms-auto">
                    <BaseDropdown flavor="context" label="Dropdown" orientation="end" condensed class="z-20"
                      shape="curved">
                      <BaseDropdownDivide />
                      <BaseDropdownItem @click="handleUpdateCode(item?._id)" title="Edit" text="Edit this code">
                        <template #start>
                          <Icon name="ph:pencil-duotone" class="me-2 block h-5 w-5" />
                        </template>
                      </BaseDropdownItem>
                      <BaseDropdownItem @click="handleDeleteCode(item?._id)" title="Delete" text="Delete this code">
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
                    New Code
                  </BaseHeading>
                  <BaseParagraph size="xs" class="text-muted-400">
                    <span>Add a new promotion code</span>
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
                  <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 sm:col-span-9">
                      <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="promoCode">
                        <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting" type="text"
                          icon="ph:subtitles-duotone" label="Promo Code" placeholder="Write code..."
                          @update:model-value="handleChange" @blur="handleBlur" />
                      </Field>
                    </div>
                    <div class="col-span-12 sm:col-span-3">
                      <div class="mt-6">
                        <BaseButton color="primary" shape="curved" @click="newPromoCode()">
                          <Icon name="ph:arrows-clockwise" class="h-4 w-4" />
                          <span>New</span>
                        </BaseButton>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-span-12">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="promoDescription">
                    <BaseTextarea :model-value="field.value" :error="errorMessage" :disabled="isSubmitting"
                      label="Description" shape="rounded" placeholder="Write description..."
                      @update:model-value="handleChange" @blur="handleBlur" />
                  </Field>
                </div>
                <div class="col-span-12 md:col-span-6">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="promoDiscount">
                    <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isSubmitting"
                      label="Discount" shape="rounded" placeholder="%" @update:model-value="handleChange"
                      @blur="handleBlur" />
                  </Field>
                </div>
                <div class="col-span-12 md:col-span-6">
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
    }" name="promoExpiry">
                            <BaseInput label="Expiry Date" icon="ph:calendar-blank-duotone" :value="inputValue"
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
                <div class="col-span-12 md:col-span-6">
                  <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="promoPeriod">
                    <BaseSelect label="Period" icon="ph:circles-four-duotone" :model-value="field.value"
                      :error="errorMessage" :disabled="isSubmitting" @update:model-value="handleChange"
                      @blur="handleBlur">
                      <option value="1week">1 Week</option>
                      <option value="2weeks">2 Weeks</option>
                      <option value="1month">1 Month</option>
                      <option value="3months">3 Months</option>
                      <option value="6months">6 Months</option>
                    </BaseSelect>
                  </Field>
                </div>
              </div>
            </TairoFormGroup>
          </div>
        </div>
      </BaseCard>
      <TairoFormSave :disabled="isSubmitting" :loading="isSubmitting" @reset="resetForm" />
    </form>

    <CodeUpdateModal :isModalOpen="isModalOpen" :updateCode="updateCode" @closeModal="handleCloseModal"
      v-if="isModalOpen" />
  </div>
</template>
