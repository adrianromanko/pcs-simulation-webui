// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import { Observable } from 'rxjs';
import { schema, normalize } from 'normalizr';
import update from 'immutability-helper';
import { createSelector } from 'reselect';
import { DeviceModelsService } from 'services';
import {
  createReducerScenario,
  createEpicScenario,
  errorPendingInitialState,
  errorReducer,
  getError
} from 'store/utilities';

// ========================= Epics - START
const handleError = fromAction => error =>
  Observable.of(redux.actions.registerError(fromAction.type, { error, fromAction }));

export const epics = createEpicScenario({
  /** Loads the list of device models */
  fetchDeviceModels: {
    type: 'DEVICE_MODELS_FETCH',
    epic: (fromAction) =>
      DeviceModelsService.getDeviceModels()
        .map(redux.actions.updateDeviceModels)
        .catch(handleError(fromAction))
  },

  /** Create a device model */
  createDeviceModel: {
    type: 'DEVICE_MODEL_INSERT',
    epic: (fromAction) =>
      DeviceModelsService.createDeviceModel(fromAction.payload)
        .map(redux.actions.createDeviceModel)
        .catch(handleError(fromAction))
  },

  /** Edit a single device model */
  editDeviceModel:{
    type: 'DEVICE_MODEL_UPDATE',
    epic: (fromAction) =>
      DeviceModelsService.updateSingleDeviceModel(fromAction.payload)
        .map(redux.actions.updateSingleDeviceModel)
        .catch(handleError(fromAction))
  },

  /** Delete a device model */
  deleteDeviceModel: {
    type: 'DEVICE_MODEL_DELETE',
    epic: (fromAction) =>
      DeviceModelsService.deleteDeviceModelById(fromAction.payload)
        .map(redux.actions.deleteDeviceModel)
        .catch(handleError(fromAction))
  }
});
// ========================= Epics - END

// Device models reducer constants
const initialState = {
  ...errorPendingInitialState,
  entities: {},
  items: []
};

// ========================= Schemas - START
const deviceModelSchema = new schema.Entity('deviceModels');
const deviceModelsSchema = new schema.Array(deviceModelSchema);
// ========================= Schemas - END

// ========================= Reducers - START
// Populate the store with multiple devices
const updateDeviceModelsReducer = (state, { payload }) => {
  const { entities: { deviceModels }, result } = normalize(payload, deviceModelsSchema);
  return update(state, {
    entities: { $set: deviceModels },
    items: { $set: result }
  });
};
// Update a single device model
const updateSingleDeviceModelReducer = (state, {payload}) => {
  return update(state, {
    entities: {[payload.id]: {$set: payload}}
  });
}
const createDeviceModelReducer = (state, { payload }) => {
  const { entities: { deviceModels }, result } = normalize([payload], deviceModelsSchema);
  return update(state, {
    entities: { $merge: deviceModels },
    items: { $splice: [[state.items.length, 0, result]] }
  });
};
const deleteDeviceModelReducer = (state, { payload }) => {
  const itemIdx = state.items.indexOf(payload);
  return update(state, {
    entities: { $unset: [payload] },
    items: { $splice: [[itemIdx, 1]] }
  });
};

export const redux = createReducerScenario({
  updateDeviceModels: { type: 'DEVICE_MODELS_UPDATE', reducer: updateDeviceModelsReducer },
  updateSingleDeviceModel: { type: 'DEVICE_MODEL_SINGLE_UPDATE', reducer: updateSingleDeviceModelReducer },
  createDeviceModel: { type: 'CREATE_DEVICE_MODEL', reducer: createDeviceModelReducer },
  deleteDeviceModel: { type: 'DELETE_DEVICE_MODEL', reducer: deleteDeviceModelReducer },
  registerError: { type: 'DEVICE_MODELS_REDUCER_ERROR', reducer: errorReducer },
});

export const reducer = { deviceModels: redux.getReducer(initialState) };
// ========================= Reducers - END

// ========================= Selectors - START
export const getDeviceModelsReducer = state => state.deviceModels;
export const getEntities = state => getDeviceModelsReducer(state).entities;
export const getItems = state => getDeviceModelsReducer(state).items;
export const getDeviceModels = createSelector(
  getEntities, getItems,
  (entities, items) => items.map(id => entities[id])
);
export const getDeleteDeviceModelError = state =>
  getError(getDeviceModelsReducer(state), epics.actionTypes.deleteDeviceModel);
// ========================= Selectors - END