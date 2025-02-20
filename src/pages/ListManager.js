import React, { Component, Fragment } from 'react';
import { withRouter, Route, Link } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import { Add as AddIcon } from '@material-ui/icons';
import { orderBy } from 'lodash';
import { compose } from 'recompose';

import ItemEditor from '../components/ItemEditor';
import ErrorSnackbar from '../components/ErrorSnackbar';

const styles = theme => ({
  list: {
    marginTop: theme.spacing(2),
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  },
});

const API = process.env.REACT_APP_API || 'http://localhost:3001';

class ListManager extends Component {
  state = {
    loading: true,
    list: [],
    error: null,
  };

  componentDidMount() {
    this.getList();
  }

  async fetch(method, endpoint, body) {
    try {
      const response = await fetch(`${API}${endpoint}`, {
        method,
        body: body && JSON.stringify(body),
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error(error);

      this.setState({ error });
    }
  }

  async getList() {
    this.setState({ loading: false, list: (await this.fetch('get', '/list')) || [] });
  }

  addItem = async (item) => {
    await this.fetch('post', '/list', item);

    this.props.history.goBack();
    await this.getList();
  }

  renderItemEditor = () => {
    const item = {};
    return <ItemEditor item={item} onSave={this.addItem} />;
  };

  render() {
    const { classes } = this.props;

    return (
      <Fragment>
        <Typography variant="h4">The List</Typography>
        {this.state.list.length > 0 ? (
          <Paper elevation={1} className={classes.list}>
            <List>
              {orderBy(this.state.list, ['title'], ['asc']).map(item => (
                <ListItem key={item._id} button component={Link} to={`/list/${item._id}`}>
                  <ListItemText
                    primary={item.name}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
          !this.state.loading && <Typography variant="subtitle1">No items to display</Typography>
        )}
        <Fab
          color="secondary"
          aria-label="add"
          className={classes.fab}
          component={Link}
          to="/list/new"
        >
          <AddIcon />
        </Fab>
        <Route path="/list/new" render={this.renderItemEditor} />
        {this.state.error && (
          <ErrorSnackbar
            onClose={() => this.setState({ error: null })}
            message={this.state.error.message}
          />
        )}
      </Fragment>
    );
  }
}

export default compose(
  withRouter,
  withStyles(styles),
)(ListManager);
