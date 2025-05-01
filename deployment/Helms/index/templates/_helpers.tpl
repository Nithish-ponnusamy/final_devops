{{/*
Return the fullname of the chart
*/}}
{{- define "index.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}