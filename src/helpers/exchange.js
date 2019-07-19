export function getImage3(token) {
  let image;
  switch (token) {
    case 'PRED':
      image = '../../../images/PRED.png';
      break;
    case 'FUN':
      image = '../../../images/FUN.png';
      break;
    default:
      image = '';
  }
  return image;
}

export function getImage2(token) {
  let image;
  switch (token) {
    case 'PRED':
      image = '../../images/PRED.png';
      break;
    case 'FUN':
      image = '../../images/FUN.png';
      break;
    default:
      image = '';
  }
  return image;
}
