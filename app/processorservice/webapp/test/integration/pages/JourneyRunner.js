sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"ns/processorservice/test/integration/pages/IncidentsList",
	"ns/processorservice/test/integration/pages/IncidentsObjectPage",
	"ns/processorservice/test/integration/pages/Incidents_conversationObjectPage"
], function (JourneyRunner, IncidentsList, IncidentsObjectPage, Incidents_conversationObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('ns/processorservice') + '/test/flpSandbox.html#nsprocessorservice-tile',
        pages: {
			onTheIncidentsList: IncidentsList,
			onTheIncidentsObjectPage: IncidentsObjectPage,
			onTheIncidents_conversationObjectPage: Incidents_conversationObjectPage
        },
        async: true
    });

    return runner;
});

