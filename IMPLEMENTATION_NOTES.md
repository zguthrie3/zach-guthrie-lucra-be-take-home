<!--
Describe implementation below.

Feel free to add any relevant info on what packages you may have added, the directory structure you chose, the tests you added etc. Is there anything you would have done differently with more time and or resources?
-->
# Zach Guthrie Implementation Notes
Line-by-line function implementation details and thoughts are provided as code comments throughout the various classes
## General Project Structure
The project structure has been refactored slightly to give stronger separation between the various classes and components contained underneath src
- Models, controllers, and services are all separated into their own modules
    - Further definition added where needed (dto vs entities in models)
- The spec tests for the service and controller layers are now in their appropriate module under folders named "\_\_tests\_\_"
    - _Implementation opinion_: these could be placed within the test folder itself instead of in src. However, this would make imports much more nested in test files, and generally decreases readability. By pairing the unit tests with the relevant code, developers can much more easily correlate the two.

This update acts as a change that improves readability of the project, and allows new developers on the team to easily identify where the various components of the project live. When new services/controllers/models are called for, the established pattern can be used to instantly know where to store the files.

## Additional Libraries/Features Used

The feature additions here did not require a large number of additional libraries. Because we are already using TypeORM and Nest.JS, we have almost all of the tools that we need:

### TypeORM Additions to Game and GameCell entities
- TypeORM allows us to easily define the one-to-many relationship between Game and GameCell
    - Because a game cell cannot exist without a game, there will never be a situation in which we want to create/delete cells independent of their parent game
    - Using the `cascade` property in TypeORM, we can make it so that the system inserts/deletes all relevant GameCells whenever we insert/delete a given Game
- We can reuse this relationship when retrieving data from the DB
    - Using the relations property of TypeORM's `find` and `findOne` methods allows TypeORM to do all of the work of joining Game to GameCells when we retrieve our games
    - _Implementation opinion_: When creating the GET endpoints for /games, I chose to return all game cells as a nested array in the response payload. I also made sure to change /games/{id} to do this as well. This ensures that the caller retrieves _all_ information associated with a given Game when calling this endpoint. However, if the user only needs to retrieve the data about the Game itself, this ends up returning a lot of extra noise. This could potentially be refactored to remove this as part of the GET based on the relevant use case when connecting these calls to the front end.

### Class Validator on DTO Object
- Since this project is leveraging Nest.JS, we can make use of the ValidationPipe provided within to ensure any payloads we receive from our API calls are validated before they enter the system
    - Required installation of `class-validator` and `class-transformer` packages
    - Validations are put in place via annotation on Model class to immediately notify the user if the payload is valid
        - In our case, this includes empty checks and ensuring both rows and columns are numbers
- This is a easy, clean, repeatable to guarantee we only receive request bodies that fulfill our criteria for processing, and can be used on all future request bodies sent to the system

## Testing
The tests written for this project are broken down into two categories: Unit Tests and E2E Tests

### Unit Tests
For the unit tests, we were able to leverage NestJS's testing modules and the mocking capabilities of jest to achieve complete code coverage over the GamesController and GamesService. Specific testing behaviors include:
- Mocking appropriate service calls at the controller level via Jest mock functions
    - Includes specific exception testing for thrown exception when receiving null response from GetByID request
- Testing business logic of all methods within GamesService
    - Includes isolated tests for specific pieces of complicated logic (calculateNeighboringBombs call)

The guiding principle for writing unit tests is that each test should try and stick to a specific function call/piece of logic. By separating each piece into individual unit tests, and sticking to descriptive names for the tests, we can clearly see the code segment that each test corresponds to.

### E2E Tests
For E2E tests, we can safely treat the operations of the underlying controller/services as a blackbox, as the inner workings of this black box are covered by unit tests. As a result, the tests themselves are scoped to focus on the HTTP calls to the server itself, and handling the appropriate response
- All E2E tests make actual HTTP calls to the server and receive back actual responses. No mocks here.

These tests also communicate directly with the actual DB when executed, allowing us to confirm real-world scenarios for the request/response
- Example: The E2E test for GET /games/{id} creates a Game in the DB, then retrieves the Game from the DB using the generated ID passed back in the first call's response

These tests are incredibly valuable, but must be done in conjunction with unit testing to be fully comprehensive. By doing both unit tests and E2E tests, we have effective testing for system behavior on a macro and micro level

## What would I do differently?
This coding assessment has been an excellent exercise in the paradigms of backend development. I tend to take a pretty polished approach to the work that I do, especially if time is not a factor. As a result, I genuinely feel that based on my current understanding of the problem state, I wouldn't make any major changes to how I chose to implement this particular project. Based on requirement clarifications and changes, there might be some alterations to the exact response structure of the GET calls. However, I believe that the solution I have provided provides the intended behaviors in a clean, concise, easily extensible manner.

That all being said, this was my first time actively working with Nest.JS. As a result, if I were in a collaborative working environment, I would definitely want to confirm some particular Nest.JS best-practice patterns with any team members that have worked with the technology before. While I am thorough when it comes to reading documentation, some lessons are easier learned from experience. Additionally, there may be some hidden 'gotchas' around the particulars of implementing Nest.JS functionality that aren't quite captured by the documentation provided. By collaborating with others, the solution could be optimized further and all team members could learn and benefit from the experience. 

### Thank you for giving me the opportunity to complete this! This was fun :) 