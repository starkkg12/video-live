export default (id: string | number) => {
  window.location.assign(`/tlsc/user?userId=${id}`)
}
