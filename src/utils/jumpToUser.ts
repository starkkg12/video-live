export default (id: string | number) => {
  window.location.assign(`/user?userId=${id}`)
}
