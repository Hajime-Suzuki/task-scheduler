# Task Scheduler (POC)

# What is this project?

A POC (proof of concept) application that schedules tasks, in a serverless manner.

**NOTE: since it is POC, there are only small amount of tests and they are all weak. Any of code is not meant to be production use.**

---

# Use Cases

- An administrator for this application can schedule tasks for a specific user, which will be processed after given days. For example, "send follow-up email to user 1234, 15 days after purchasing an item".
- A task is scheduled for a given date, not date and time.
- An Administrator can see all history of tasks for a given user, including ones already executed.
- An Administrator can remove only scheduled task.

---

# Expected Load

- 100,000 requests are scheduled per day

---

# Stack

- AWS DynamoDB
- AWS DynamoDB Stream
- AWS Lambda Functions
- AWS EventBridge
- AWS API Gateway

---

# API Gateway endpoints

| Method | URI                     | Description               |
| ------ | ----------------------- | ------------------------- |
| GET    | /tasks/userId/requestId | find single task          |
| GET    | /tasks/userId           | find tasks for given user |
| POST   | /tasks                  | schedule new task         |
| DELETE | /tasks/user/requestId   | remove task               |

Please take a look at the `./request-examples` folder for example HTTP requests

---

# How scheduled tasks are executed

![scheduler-flow](docs/scheduler-flow.png 'Scheduler flow')

- A task has a status of either `SCHEDULED`, `STARTED`, `COMPLETED`. Initial status is `SCHEDULED` and `STARTED` once it gets executed, and `COMPLETED` once all process for the task has been finished. For this application, progress of status is up to `STARTED` for simplicity
- There is an scheduler by EventBridge. It executes a lambda function called `StartScheduledTasks` (step 2 in the diagram above) for each hour between 00:00 and 05:00 UTC. Although all scheduled tasks are meant to be executed at 00:00, triggers between 01:00 - 05:00 act as a simple failure recovery.
- `StartScheduledTasks` gets all scheduled tasks from the `TaskTable` where the scheduled tasks are stored, then update them by setting `status = STARTED`.
- By updating the items, the DynamoDB streams are triggered. The lambda function called `HandleStartedTask` is invoked, which puts updated tasks in the queue called `ProcessedTaskQueue`.

**The queue is for simulating processing updated items. For a real application, you will take actions required for your application, such as publishing an event.**

---

# How DynamoDB table is structured

### Key schema

The main table has userId as PK (partition key), and requestId as SK (sort key). Request Id is UUID so that there can be multiple tasks per user.

### GSI

To find tasks by due date, GSI (global secondary index) is used. The PK of the GSI is due date and the SK is requestId.

### Sharding GSI PK

The due date on the GSI is not distributed well, so the GSI becomes throttled when there are many write requests in a short time to the main table. Updating the scheduled items is the exactly the case (step 2 in the diagram above). Because throttling on GSI affects write requests of the main table, the main table ends up with being throttled.

Having sharded PK would help mitigate throttling. In this case, a random integer is attached to the end of the dueDate, so they have the same due date but are distributed by the number of shards. For example, it is 50 for this application, therefore, dueDate becomes between '2020-01-01#1' to '2020-01-01#50'.

![GIS Throttling](./docs/gsi-throttling.png 'GIS Throttling')

As trade-off, when getting all scheduled tasks by due date, you need to query with all shards, then aggregate them.

![Query with Shard Number](./docs/gsi-sharding-query.png 'Query with Shard Number')

---

# Application structure

![Application Structure](./docs/application-structure.png 'Application Structure')

## Domain

Nothing in this folder relies **directly** on any infrastructure related module. Any dependencies outside the folder need to implement interfaces defined here.
The folder consists of sub folders: entities, use-cases and interfaces.

### entities

It contains pure functions to handle any business logic.

### use cases

It contains side-effects, or more complex work by using (multiple) entities.

### interfaces

It contains interfaces that are implemented by repositories or any infrastructure related functions.

## Handlers

A Handler is an entry point of a lambda function. It injects dependencies and necessary data into a use case. No business logic is allowed to be written here.

## Repositories

A repository communicates with external services, such as database and AWS services, then returns corresponding entity. No business logic is allowed to be written here.

## Utils

It contains utility functions. No business logic is allowed to be written here.

---

# Performance Comparison: 50 Shards vs 1 Shard

Test case:

`GIVEN` there are 100000 items in the task table with due date of 2022-02-01

`WHEN` trigger the `StartScheduledTasks` lambda function with date = 2022-02-01

`THEN` there should be 100000 messages in the SQS queue eventually

`AND` all items with the due date of 2022-02-01 have status = 'STARTED'

<br>

## Shard Size = 50

### StartScheduledTasks

Duration: 46143.90 ms

Max Memory Used: 462 MB

### Task Table

![performance: 50 shards](./docs/performance-50-shards.png 'performance: 50 shards')

No throttling happened

Peak RCU: 1172 per second

### Queue

![messages](./docs/messages-in-queue.png 'messages')
All tasks were processed successfully.

---

## Shard Size = 1

### StartScheduledTasks

Duration: 62869.20 ms

Max Memory Used: 424 MB

### Task Table

Main table throttling: 511

GSI write throttling: 6224

Peak RCU: 1604 per second

![performance: single shard](./docs/performance-single-shard.png 'performance: single shard')

### Queue

![messages](./docs/messages-in-queue.png 'messages')

All tasks were processed successfully.

---

# How to Run the Application

**PLEASE NOTE: `yarn run setup` and `yarn start` will add/modify resources in your AWS account. It would incur usage fee**

Create `./terraform/config/remote.config` file with your settings:

```
region         = <your region>
bucket         = <s3 bucket to store the tfstate>
key            = "s3 bucket key for the tfstate file"
profile        = "aws profile number"
```

Create `./terraform/config/terraform.tfvars` file with your settings:

```
profile = <aws profile number>
region  = <your region>
```

- run `yarn install` to add dependencies
- run `yarn tf:all` to deploy the stack with terraform & serverless framework
- run `yarn setup` to seed database
- run `yarn start` to update the table items with status = 'STARTED'

---

# Ideas for Improvements

- Execute scheduled tasks more frequently (e.g. every hour), if requirements allow it. It significantly reduces a hot partition problem.
- If the number of scheduled tasks increased a lot, split StartScheduledTasks into process: 1. read all scheduled tasks and put message. into a queue. 2. update status.
- More failure recovery
- Rate limit for batchWriteItem for started tasks
