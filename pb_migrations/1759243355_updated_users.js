/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "authAlert": {
      "emailTemplate": {
        "body": "<p>Bonjour,</p>\n<p>Nous avons détecté une connexion à votre compte {APP_NAME} depuis un nouvel emplacement.</p>\n<p>Si c’était bien vous, vous pouvez ignorer cet e-mail.</p>\n<p><strong>Si ce n’était pas vous, vous devriez immédiatement changer le mot de passe de votre compte {APP_NAME} afin de révoquer l’accès depuis tous les autres emplacements.</strong></p>\n<p>\n  Merci,<br/>\n  L’équipe {APP_NAME}\n</p>",
        "subject": "Connexion depuis un nouvel emplacement"
      }
    },
    "resetPasswordTemplate": {
      "body": "<p>Bonjour,</p>\n<p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Réinitialiser le mot de passe</a>\n</p>\n<p><i>Si vous n’avez pas demandé à réinitialiser votre mot de passe, vous pouvez ignorer cet e-mail.</i></p>\n<p>\n  Merci,<br/>\n  L’équipe {APP_NAME}\n</p>\n",
      "subject": "Réinitialisez votre mot de passe {APP_NAME}"
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "authAlert": {
      "emailTemplate": {
        "body": "<p>Hello,</p>\n<p>We noticed a login to your {APP_NAME} account from a new location.</p>\n<p>If this was you, you may disregard this email.</p>\n<p><strong>If this wasn't you, you should immediately change your {APP_NAME} account password to revoke access from all other locations.</strong></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Login from a new location"
      }
    },
    "resetPasswordTemplate": {
      "body": "<p>Hello,</p>\n<p>Click on the button below to reset your password.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Reset password</a>\n</p>\n<p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
      "subject": "Reset your {APP_NAME} password"
    }
  }, collection)

  return app.save(collection)
})
