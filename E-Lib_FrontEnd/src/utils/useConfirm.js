// src/utils/confirmHelper.js
import { useConfirm } from 'primevue/useconfirm'

export const addConfirm = ({
  type = 'default',
  message = 'Are you sure?',
  header = 'Confirmation',
  onAccept = () => {},
  onReject = () => {},
  customIcon = null,
}) => {
  const confirm = useConfirm()

  // Define presets based on "type"
  const configs = {
    danger: {
      header: header || 'Danger Action',
      icon: 'pi pi-exclamation-triangle',
      rejectClass: 'p-button-secondary p-button-outlined',
      acceptClass: 'p-button-danger',
      acceptLabel: 'Confirm',
    },
    info: {
      header: header || 'Information',
      icon: 'pi pi-info-circle',
      acceptClass: 'p-button-info',
      acceptLabel: 'OK',
    },
    loan: {
      header: 'Loan Processing',
      icon: 'pi pi-book',
      acceptLabel: 'Issue Book',
      acceptClass: 'p-button-success',
    },
  }

  const selectedConfig = configs[type] || configs.danger

  confirm.require({
    ...selectedConfig,
    message,
    header: header || selectedConfig.header,
    icon: customIcon || selectedConfig.icon,
    accept: onAccept,
    reject: onReject,
  })
}
