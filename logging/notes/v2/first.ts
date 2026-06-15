/*

now our log will not create traceId
openTelemetry will create it 

*/

/*


need to know few opentelemetry components 
first is -> @opentelemetry/api
second is -> @opentelemetry/sdk-node
third is -> @opentelemetry/auto-instrumentations-node



-> api provide trace and context
-> trace provide getActiveSpan and setActiveSpan -> trace.getActiveSpan()

-> sdk-node is like engine , without it api will not be able to provide all those values 



*/

/*

the sdk must start before express app 


command to install tools 

npm install \
@opentelemetry/api \
@opentelemetry/sdk-node \
@opentelemetry/auto-instrumentations-node




*/

/*

npm install @opentelemetry/exporter-trace-otlp-http

it is an exporter , as we need to share the spanid and all details outisde
our application , and so we need an exporter , otherwise this span id and all details
will stay inside our application 
*/

/*

so our architecture is going to be like this 

Todo App
   ↓
OTLP Exporter
   ↓
Grafana Alloy

grafana alloy handles logs, metrics and traces 



after that our architecture will be this 

Express
 ↓
OpenTelemetry
 ↓
Alloy
 ↓
Tempo
*/



