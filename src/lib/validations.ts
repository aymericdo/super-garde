import type { RecordModel } from "pocketbase"
import type { CalendarEvent } from "./interfaces/calendar"

export const onCallErrorValidation = (event: CalendarEvent, selectedStudent: RecordModel) => {
  if (event.sector === 'URTC' && !selectedStudent.year.includes(['MM2', 'MM3'])) {
    return "Pour faire la tâche URTC, l'étudiant doit être en MM2 ou MM3."
  } else if (event.sector === 'UHCD' && !selectedStudent.UHCD) {
    return "Pour faire la tâche UHCD, l'étudiant doit avoir fait la formation."
  } else {
    return null
  }
}