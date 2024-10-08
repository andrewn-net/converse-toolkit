## Converse Toolkit

This app provides a toolkit of functions (no workflow) to create custom Slack conversations generated by AI.  These functions can be used as steps in Slack's next-generation platform Workflow Builder.

## Setup

### OpenAI API Key

Visit https://platform.openai.com/ to sign-up and create an OpenAI API key.

### Clone the Template

Start by cloning this repository:

```zsh
# Clone this project onto your machine
$ slack create converse-toolkit -t andrewn-net/converse-toolkit
# Change into the project directory
$ cd converse-toolkit
```

## Running Your Project Locally

While building your app, you can see your changes appear in your workspace in
real-time with `slack run`. You'll know an app is the development version if the
name has the string `(local)` appended.

```zsh
# Run app locally
$ slack run

Connected, awaiting events
```

To stop running locally, press `<CTRL> + C` to end the process.

## Deploying Your App

Once development is complete, deploy the app to Slack infrastructure using
`slack deploy`:

```zsh
$ slack deploy
```

## Viewing Activity Logs

Activity logs of your application can be viewed live and as they occur with the
following command:

```zsh
$ slack activity --tail
```

## Project Structure

### `functions/`

[Functions](https://api.slack.com/automation/functions) are reusable building
blocks of automation that accept inputs, perform calculations, and provide
outputs. Functions can be used independently or as steps in workflows.

### `manifest.ts`

The [app manifest](https://api.slack.com/automation/manifest) contains the app's
configuration. This file defines attributes like app name and description.

### `.slack/`

Contains `apps.dev.json` and `apps.json`, which include installation details for
development and deployed apps.
