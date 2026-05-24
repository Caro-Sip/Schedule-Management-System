as an admin i should be able to

- create a class aka class entity
- create a schedule inside class that reoccurs
- by creating schdulr, the course tied to the schedule is somehow linked with the class
- can mark schedule as absent, otherwise system marks as attended
- can book a makeup for missed course schedule

- Create class entities
    - class entities should be changed to have a start date and end date for their semester
    - a year has 2 semesters

- Creating a schedule inside of a class for course hours
    - choose start and end hours, default 2 hours of (7-9, 9-11, 1-3, and 3-5)
    - a checkbox for reoccurence of the course
        - if checked, the course will repeat until when the semester ends for that class
    - choose available rooms
        - can be done through calling all available rooms function to the frontend as memory
        - room can be filtered via typing the following drop down box
            - when typed `j6`: all available rooms from building J floor 5 is shown
            - when typed `A1`: all available rooms from building A ground floor is shown
            - the client will parse `J603` as the json of room objects to their respective data
        - professor name of typed filter logic
        - subject name
            - course (subjects) are created and linked to the class for future reference
        - type of hours chosen to either be lecture or tutorial or practical
