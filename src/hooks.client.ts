import { pb } from '$lib/pocketbase'
import { currentUser } from '$lib/stores/user'

pb.authStore.loadFromCookie(document.cookie)
pb.authStore.onChange(() => {
  currentUser.set(pb.authStore.model)
  document.cookie = pb.authStore.exportToCookie({
    httpOnly: false,
    secure: true,
    sameSite: 'None',
    path: '/',
    domain: 'super-garde.aymericdo.ovh',
  })
}, true)
