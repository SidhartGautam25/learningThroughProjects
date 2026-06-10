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






*/
