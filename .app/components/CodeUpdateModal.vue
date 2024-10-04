<script setup lang="ts">
import { z } from 'zod';
import { DatePicker } from 'v-calendar'
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';

import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'

const props = defineProps<{
  isModalOpen?: boolean,
  updateCode: any,
}>()

const VALIDATION_TEXT = {
  CODE_REQUIRED: "Promo code can't be empty",
  DISCOUNT_EMPTY_REQUIRED: "Promocode can't be empty",
  DISCOUNT_NUMBER_REQUIRED: "Promocode must be number",
}

const udpateSchema = z
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
    } else {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_TEXT.DISCOUNT_EMPTY_REQUIRED,
        path: ['promoDiscount'],
      })
    }
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type UpdateFormInput = z.infer<typeof udpateSchema>

const validationSchema = toTypedSchema(udpateSchema)
const initialValues = computed<UpdateFormInput>(() => ({
  promoCode: props.updateCode.promoCode || '',
  promoDescription: props.updateCode.promoDescription || '',
  promoDiscount: props.updateCode.promoDiscount.toString() || '',
  promoExpiry: new Date(props.updateCode.promoExpiry) || null,
  promoPeriod: props.updateCode.promoPeriod || '',
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
const date = ref(new Date(props.updateCode.promoExpiry))
const masks = ref({
  input: 'YYYY-MM-DD',
})

const onUpdate = handleUpdateSubmit(
  async (values) => {
    try {
      const body = {
        codeId: props.updateCode.codeId,
        promoCode: values.promoCode,
        promoDescription: values.promoDescription,
        promoDiscount: Number(values.promoDiscount),
        promoExpiry: (new Date(date.value)).toISOString().split('T')[0],
        promoPeriod: values.promoPeriod,
      }

      const result = await useFetch('/api/promocode/update', { method: "PUT", body: body })

      if (result.data?.value?.ok) {
        toaster.clearAll()
        toaster.show({
          title: 'Success',
          message: `Promo code has been updated!`,
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
            Update Promo Code
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
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="promoCode">
                <BaseInput :model-value="field.value" label="Promo Code" :error="errorMessage"
                  :disabled="isUpdateSubmitting" type="text" icon="ph:subtitles-duotone" placeholder="Promo Code"
                  @update:model-value="handleChange" @blur="handleBlur" />
              </Field>
            </div>
            <div class="col-span-12">
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="promoDescription">
                <BaseTextarea :model-value="field.value" :error="errorMessage" :disabled="isUpdateSubmitting"
                  label="Promo Description" shape="rounded" placeholder="Write description info..."
                  @update:model-value="handleChange" @blur="handleBlur" />
              </Field>
            </div>

            <div class="col-span-12 md:col-span-6">
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="promoDiscount">
                <BaseInput :model-value="field.value" :error="errorMessage" :disabled="isUpdateSubmitting"
                  label="Discount" shape="rounded" placeholder="%" @update:model-value="handleChange"
                  @blur="handleBlur" />
              </Field>
            </div>
            <div class="col-span-12 md:col-span-6">
              <DatePicker v-model="date" :masks="masks" :min-date="new Date()" mode="date" hide-time-header trim-weeks>
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
            <div class="col-span-12 md:col-span-12">
              <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="promoPeriod">
                <BaseSelect label="Period" icon="ph:circles-four-duotone" :model-value="field.value"
                  :error="errorMessage" :disabled="isUpdateSubmitting" @update:model-value="handleChange"
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
