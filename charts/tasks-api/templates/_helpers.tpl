{{- define "tasks-api.name" -}}
tasks-api
{{- end }}

{{- define "tasks-api.labels" -}}
app: {{ include "tasks-api.name" . }}
app.kubernetes.io/name: {{ include "tasks-api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
