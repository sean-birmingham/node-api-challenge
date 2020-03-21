const express = require('express');

const Projects = require('../data/helpers/projectModel');
const Actions = require('../data/helpers/actionModel');

const router = express.Router();

router.use(express.json());

router.get('/', (req, res) => {
  Projects.get()
    .then(projects => {
      res.status(200).json(projects);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error retrieving the projects', err });
    });
});

router.get('/:id', validateProjectId, (req, res) => {
  res.status(200).json(req.project);
});

router.get('/:id/actions', (req, res) => {
  const { id } = req.params;
  Projects.getProjectActions(id)
    .then(actions => {
      res.status(200).json(actions);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error retrieving the actions', err });
    });
});

router.post('/', validateProject, (req, res) => {
  const projectInfo = req.body;

  Projects.insert(projectInfo)
    .then(project => {
      res.status(201).json({ project });
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: 'Error saving project to the database', err });
    });
});

router.post('/:id/actions', [validateProjectId, validateAction], (req, res) => {
  const actionInfo = { ...req.body, project_id: req.params.id };

  Actions.insert(actionInfo)
    .then(action => {
      res.status(201).json(action);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error saving action to the database' });
    });
});

router.put('/:id', [validateProjectId, validateProject], (req, res) => {
  const { id } = req.params;
  const projectData = req.body;

  Projects.update(id, projectData)
    .then(project => {
      if (project) {
        res.status(200).json({ project });
      } else {
        res.status(404).json({ message: 'The project could not be found' });
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Error updating the project', err });
    });
});

router.put(
  '/:id/actions/:id',
  [validateActionId, validateAction],
  (req, res) => {
    const { id } = req.params;
    const actionData = req.body;

    Actions.update(id, actionData)
      .then(action => {
        if (action) {
          res.status(200).json(action);
        } else {
          res.status(404).json({ message: 'The action could not be found' });
        }
      })
      .catch(err => {
        res.status(500).json({ message: 'Error updating the action', err });
      });
  }
);

router.delete('/:id', validateActionId, (req, res) => {
  const { id } = req.params;

  Projects.remove(id).then(count => {
    if (count > 0) {
      res.status(200).json({ message: 'The project has been removed' });
    } else {
      res.status(404).json({ message: 'The project could not be found' });
    }
  });
});

router.delete('/:id/actions/:id', validateActionId, (req, res) => {
  const { id } = req.params;

  Actions.remove(id).then(count => {
    if (count > 0) {
      res.status(200).json({ message: 'The action has been removed' });
    } else {
      res.status(404).json({ message: 'The action could not be found' });
    }
  });
});

function validateProjectId(req, res, next) {
  const { id } = req.params;

  Projects.get(id).then(project => {
    if (project) {
      req.project = project;
      next();
    } else {
      res.status(400).json({ message: 'invalid project id' });
    }
  });
}

function validateActionId(req, res, next) {
  const { id } = req.params;

  Actions.get(id).then(action => {
    if (action) {
      req.action = action;
      next();
    } else {
      res.status(400).json({ message: 'invalid action id' });
    }
  });
}

function validateProject(req, res, next) {
  const body = req.body;

  if (!body || body === {}) {
    res.status(400).json({ message: 'missing project data' });
  } else if (!body.name || !body.description) {
    res
      .status(400)
      .json({ message: 'missing required name and description fields' });
  } else {
    next();
  }
}

function validateAction(req, res, next) {
  const body = req.body;

  if (!body || body === {}) {
    res.status(400).json({ message: 'missing action data' });
  } else if (!body.description || !body.notes) {
    res.status(400).json({ message: 'missing description and notes' });
  } else if (body.description.length > 128) {
    res
      .status(400)
      .json({ message: 'description must be less than 128 characters' });
  } else {
    next();
  }
}

module.exports = router;
