let indexNotPermited = 2;
export function pathFinder(posInicial, posFinal,map, sprites) {
    const final =  {x:Math.floor(posFinal.x/32),y: Math.floor(posFinal.y/32)};
    const inicial = {x:Math.floor(posInicial.x/32),y: Math.floor(posInicial.y/32)};
    let fimTile = -1;

    for (let i = 0; i < map.culledTiles.length; i++) {
        const element = map.culledTiles[i];
            if(element.x == final.x && element.y == final.y){
                fimTile = element;
                break;
            }
            
    } 

    if(fimTile.index <= indexNotPermited){
        return null;
    } 
    let obstaculos = [];
    for (let i = 0; i < sprites.length; i++) {
      const element = sprites[i];
      if(element.x != inicial.x && element.y != inicial.y){
        let receiver = criarObstaculo(element);
          if(receiver != null) obstaculos.push( receiver );
      }
    }
    
    
    const path = findPathAStar(inicial, final, map.culledTiles, obstaculos, map.width, map.height);
    return path;
    
}



export function findPath(posInicial, posFinal, map ,sprites) {
    const final =  {x:Math.floor(posFinal.x/32),y: Math.floor(posFinal.y/32)};
    const inicial = {x:Math.floor(posInicial.x/32),y: Math.floor(posInicial.y/32)};
    let obstaculos = [];
    for (let i = 0; i < sprites.length; i++) {
      const element = sprites[i];
      if(element.x != inicial.x && element.y != inicial.y){
        let receiver = criarObstaculo(element);
          if(receiver != null) obstaculos.push( receiver );
      }
    }
    
    const path = [];
    let current = { ...inicial };
  
    while (current.x !== final.x || current.y !== final.y) {
      
      const dx = final.x - current.x;
      const dy = final.y - current.y;
  
      // Calcula a direção do movimento
      const directionX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
      const directionY = dy > 0 ? 1 : dy < 0 ? -1 : 0;
  
      // Verifica se a próxima célula está no mapa
      const nextX = current.x + directionX;
      const nextY = current.y + directionY;
        
      const nextCell = map.find(
        cell => cell.x === nextX && cell.y === nextY && cell.index >= 2 
        && !obstaculos.some(obstacle => obstacle.x === cell.x && cell.y === neighbor.y && obstacle.index)
      );
  
      if (nextCell) {
        path.push(nextCell);
        current = { x: nextX, y: nextY };
      } else {
        // Não é possível mover nessa direção
        return false;
      }
    }
    
    return path;
  }
  
  function calculateDistance(pointA, pointB) {
    // Calcula a distância euclidiana entre dois pontos
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  export function findPathAStar(initial, final, map, obstacles ,mapWidth,mapHeight) {
    const openSet = [initial];
    const cameFrom = {};
    const gScore = {};
    gScore[initial.x + "," + initial.y] = 0;
  
    const fScore = {};
    fScore[initial.x + "," + initial.y] = calculateDistance(initial, final);

    let iterations = 0;
    const maxIterations = 1000;
    while (openSet.length > 0) {
      if (iterations >= maxIterations) {
        // Limite de iterações atingido, retorne null
        return null;
      }
      iterations++;

      openSet.sort((a, b) => fScore[a.x + "," + a.y] - fScore[b.x + "," + b.y]);
      const current = openSet.shift();
  
      if (current.x === final.x && current.y === final.y) {
        const path = [];
        let currentCell = final;
        while (currentCell.x !== initial.x || currentCell.y !== initial.y) {
          path.unshift(currentCell);
          currentCell = cameFrom[currentCell.x + "," + currentCell.y];
        }

        return path;
      }
      
      const neighbors = [
        { x: current.x - 1, y: current.y },
        { x: current.x + 1, y: current.y },
        { x: current.x, y: current.y - 1 },
        { x: current.x, y: current.y + 1 },
      ];
  
      for (const neighbor of neighbors) {
        if (
          neighbor.x < 0 ||
          neighbor.x >= mapWidth ||
          neighbor.y < 0 ||
          neighbor.y >= mapHeight ||
          map.some(cell => cell.x === neighbor.x && cell.y === neighbor.y && cell.index <= 2) ||
          obstacles.some(obstacle => obstacle.x === neighbor.x && obstacle.y === neighbor.y && obstacle.index)
        ) {
          continue; 
        }
  
        const tentativeGScore = gScore[current.x + "," + current.y] + 1;
  
        if (
          !gScore[neighbor.x + "," + neighbor.y] ||
          tentativeGScore < gScore[neighbor.x + "," + neighbor.y]
        ) {
          cameFrom[neighbor.x + "," + neighbor.y] = current;
          gScore[neighbor.x + "," + neighbor.y] = tentativeGScore;
          fScore[neighbor.x + "," + neighbor.y] =
            tentativeGScore + calculateDistance(neighbor, final);
  
          if (!openSet.some(cell => cell.x === neighbor.x && cell.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }
  
    return null; // Não foi possível encontrar um caminho
  }


function criarObstaculo(obstaculo){
  if(obstaculo.name == "porta"){

    let p1 = {x:Math.floor(obstaculo.x/32),y:Math.floor(obstaculo.y/32),index:obstaculo.properties.find(el => el.name == 'isLock')['value']};

    if(obstaculo.properties.find(el => el.name == 'pos')['value'] == '4'){
      let p2 = {x:Math.floor(obstaculo.x/32),y:Math.floor(obstaculo.y/32)+1,index:obstaculo.properties.find(el => el.name == 'isLock')['value']}
      return (p1,p2);
    }
    return p1;
  }
  return null;

}