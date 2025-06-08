export default (id: string | number) => {
  window.location.assign(`/tlsc/predict-detail?predictId=${id}`)
}
