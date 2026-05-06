from howlongtobeatpy import HowLongToBeat
import sys
import json

def search_game(title):
    try:
        results = HowLongToBeat().search(title)
        if results is not None and len(results) > 0:
            # Pegamos o resultado com maior similaridade
            best_element = max(results, key=lambda element: element.similarity)
            
            # O howlongtobeatpy retorna os tempos em horas diretamente
            data = {
                "name": best_element.game_name,
                "gameplayMain": best_element.main_story,
                "gameplayMainExtra": best_element.main_extra,
                "gameplayCompletionist": best_element.completionist
            }

            print(json.dumps(data))
        else:
            print(json.dumps({"error": "Nenhum resultado encontrado"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        search_game(sys.argv[1])
    else:
        print("Uso: python3 test_hltb.py 'Nome do Jogo'")
