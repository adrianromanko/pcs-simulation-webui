// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { svgs } from 'utilities';
import { Btn, BtnToolbar, Modal } from 'components/shared';

import './deleteModal.css';

export const DeleteModal = ({ t, onClose, deviceModelName, onDelete }) => (
  <Modal onClose={onClose}>
    <div className="delete-modal-container">
      <div className="delete-modal-header">
        {t('deviceModels.flyouts.delete.header')}
        <Btn svg={svgs.x} className="modal-icon" onClick={onClose} />
      </div>
      <div className="delete-modal-content">
        {t('deviceModels.flyouts.delete.description', { deviceModelName })}
      </div>
      <BtnToolbar>
        <Btn svg={svgs.trash} onClick={onDelete}>
          {t('deviceModels.flyouts.delete.apply')}
        </Btn>
        <Btn svg={svgs.cancelX} onClick={onClose}>{t('deviceModels.flyouts.cancel')}</Btn>
      </BtnToolbar>
    </div>
  </Modal>
);
