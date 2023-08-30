import { Modal, useModal } from '@faceless-ui/modal'
import React, { useCallback, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'

import type { Props } from './types.js'

import { getTranslation } from '../../../../utilities/getTranslation.js'
import { requests } from '../../../api.js'
import useTitle from '../../../hooks/useTitle.js'
import { useForm } from '../../forms/Form/context.js'
import MinimalTemplate from '../../templates/Minimal/index.js'
import { useConfig } from '../../utilities/Config/index.js'
import Button from '../Button/index.js'
import './index.scss'

const baseClass = 'delete-document'

const DeleteDocument: React.FC<Props> = (props) => {
  const {
    buttonId,
    collection: { labels: { singular } = {}, slug } = {},
    collection,
    id,
    title: titleFromProps,
  } = props

  const {
    routes: { admin, api },
    serverURL,
  } = useConfig()
  const { setModified } = useForm()
  const [deleting, setDeleting] = useState(false)
  const { toggleModal } = useModal()
  const history = useHistory()
  const { i18n, t } = useTranslation('general')
  const title = useTitle(collection)
  const titleToRender = titleFromProps || title

  const modalSlug = `delete-${id}`

  const addDefaultError = useCallback(() => {
    toast.error(t('error:deletingTitle', { title }))
  }, [t, title])

  const handleDelete = useCallback(() => {
    setDeleting(true)
    setModified(false)
    requests
      .delete(`${serverURL}${api}/${slug}/${id}`, {
        headers: {
          'Accept-Language': i18n.language,
          'Content-Type': 'application/json',
        },
      })
      .then(async (res) => {
        try {
          const json = await res.json()
          if (res.status < 400) {
            toggleModal(modalSlug)
            toast.success(t('titleDeleted', { label: getTranslation(singular, i18n), title }))
            return history.push(`${admin}/collections/${slug}`)
          }

          toggleModal(modalSlug)

          if (json.errors) {
            json.errors.forEach((error) => toast.error(error.message))
          } else {
            addDefaultError()
          }
          return false
        } catch (e) {
          return addDefaultError()
        }
      })
  }, [
    setModified,
    serverURL,
    api,
    slug,
    id,
    toggleModal,
    modalSlug,
    t,
    singular,
    i18n,
    title,
    history,
    admin,
    addDefaultError,
  ])

  if (id) {
    return (
      <React.Fragment>
        <Button
          onClick={() => {
            setDeleting(false)
            toggleModal(modalSlug)
          }}
          buttonStyle="none"
          className={`${baseClass}__toggle`}
          id={buttonId}
        >
          {t('delete')}
        </Button>
        <Modal className={baseClass} slug={modalSlug}>
          <MinimalTemplate className={`${baseClass}__template`}>
            <h1>{t('confirmDeletion')}</h1>
            <p>
              <Trans
                i18nKey="aboutToDelete"
                t={t}
                values={{ label: getTranslation(singular, i18n), title: titleToRender }}
              >
                aboutToDelete
                <strong>{titleToRender}</strong>
              </Trans>
            </p>
            <div className={`${baseClass}__actions`}>
              <Button
                buttonStyle="secondary"
                id="confirm-cancel"
                onClick={deleting ? undefined : () => toggleModal(modalSlug)}
                type="button"
              >
                {t('cancel')}
              </Button>
              <Button id="confirm-delete" onClick={deleting ? undefined : handleDelete}>
                {deleting ? t('deleting') : t('confirm')}
              </Button>
            </div>
          </MinimalTemplate>
        </Modal>
      </React.Fragment>
    )
  }

  return null
}

export default DeleteDocument