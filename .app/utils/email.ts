import sendgrid from '@sendgrid/mail';

export const EMAIL_SENDER: string = "no-reply@forfliescrypto.com";

export interface ResetPasswordEmail {
  to: string;
  action_url: string;
  operating_system?: string;
  browser_name?: string;
  support_url: string;
}

export async function sendResetEmail(info: ResetPasswordEmail) {
  const config = useRuntimeConfig()

  // Get reset password email option
  const mailOption = {
    from: {
      email: EMAIL_SENDER
    },
    personalizations: [
      {
        to: [
          {
            email: info.to
          }
        ],
        dynamic_template_data: {
          action_url: info.action_url,
          support_url: info.support_url,
          operating_system: info.operating_system,
          browser_name: info.browser_name,
        }
      }
    ],
    template_id: config.sendgrid_forgot_pass_email
  };

  if (mailOption) {
    try {
      sendgrid.setApiKey(config.sendgrid_api_key);
      const result = await sendgrid.send(mailOption)
      if (result) return { success: true, message: 'Email sent successfully.' };
    } catch (error) {
      console.error(error);
    }
  }

  return { success: false, message: 'Email type or something went wrong.' };
}