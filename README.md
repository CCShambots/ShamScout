## Publishing new Releases
- Update the version number with the year as the major version. Bump the minor version for new features and bump the patch number for bug fixes.
  - Ex. 2023.1.1 --> 2024.0.0 at the start of a new season
  - Ex. 2023.1.1 --> 2023.2.0 when adding new features
  - Ex. 2023.1.1 --> 2023.1.2 when patching bugs
- Run `npm run build`
- Create and set your Github token as a path variable ("GITHUB_TOKEN")
- Run `npm run publish`
- Upload the most recent version of ShamScout Editor 

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
