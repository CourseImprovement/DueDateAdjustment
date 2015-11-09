# DueDateAdjustment
This is a due date adjustment tool for Desire to Learn (Brightspace)

Usage
=====
Follow these steps:
 - Inside a D2L Course, create an activity where HTML pages can be modified
 - Import JQuery

```
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
```

 - Import the build

```
<script src='duedateadjustment.js?orgId={orgId}&orgName={orgName}&orgUnitId={orgUnitId}&orgUnitName={orgUnitName}&d2lddc=true'></script>
```

Development steps
=================
 - Clone the repository
 - npm install
 - grunt
 	- this concats and watches files for changes

TODO
====
 - Search code for "TODO"