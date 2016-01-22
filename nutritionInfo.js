var wolframAlpha = 
    require('wolfram-alpha').createClient(process.env.WOLFRAM_APPID),
    
    /**
    * Cached Nutrition Data because Wolfram is so freaking slow.
    * Yo Wolfram, how about you invest on some servers for Wolfram Alpha?
    */
    cachedNutritionInfo = {
        Burger: {
            calories: 421,
            fat: 20,
            cholesterol: 57,
            sodium: 647,
            carbohydrate: 38,
            protein: 22,
            sugar: 8,
            servingSize: "1 hamburger",
            image: "http://www.tastyburger.com/wp-content/themes/tastyBurger/images/home/img-large-burger.jpg"
        },
        Grape: {
            calories: 103,
            fat: 385,
            cholesterol: 0,
            sodium: 3,
            carbohydrate: 27,
            protein: 1,
            sugar: 24,
            servingSize: "1 cup",
            image: "http://drinkre.com/wp-content/uploads/2014/07/white-grapes.png"
        },
        Banana: {
            calories: 105,
            fat: 389,
            cholesterol: 0,
            sodium: 1,
            carbohydrate: 27,
            protein: 1,
            sugar: 14,
            servingSize: "1 banana", 
            image: "http://dreamatico.com/data_images/banana/banana-5.jpg"
        },
        Cookie: {
            calories: 68,
            fat: 3,
            cholesterol: 3,
            sodium: 51,
            carbohydrate: 10,
            protein: 847,
            sugar: 5,
            servingSize: "1 cookie (15g)",
            image: "http://img1.wikia.nocookie.net/__cb20140616194746/pandorahearts/de/images/4/42/Cookie.gif"
        },
        Spaghetti: {
            calories: 491,
            fat: 4,
            cholesterol: 5,
            sodium: 279,
            carbohydrate: 93,
            protein: 21,
            sugar: 5,
            servingSize: "1 cup (257g)",
            image: "http://a.ctimg.net/MViy-En7QpuIQCXEzvhoMA/recipespaghetti-meat-sauce-recipe.jpg"
        },
        "Vanilla Ice Cream": {
            calories: 186,
            fat: 7,
            cholesterol: 26,
            sodium: 78,
            carbohydrate: 27,
            protein: 4,
            sugar: 16,
            servingSize: "0.5 cups (107g)",
            image: "http://blacklemag.com/wp-content/uploads/2013/07/vanillaicecream.jpg"
        },
        Doritos: {
            calories: 140,
            fat: 8,
            cholesterol: 0,
            sodium: 180,
            carbohydrate: 16,
            protein: 2,
            sugar: 0,
            servingSize: "11 chips (28g)",
            image: "http://www.fritolay.com/images/default-source/blue-bag-image/doritos-nacho-cheese.png?sfvrsn=2"
        },
        "Apple fruit": {
            calories: 91,
            fat: 273,
            cholesterol: 0,
            sodium: 910,
            carbohydrate: 24,
            protein: 482,
            sugar: 19,
            servingSize: "1 apple (182g)",
            image: "http://louisianalawblog.wp.lexblogs.com/wp-content/uploads/sites/342/2015/02/app.jpg"
        },
        "Fried Chicken": {
            calories: 222,
            fat: 12,
            cholesterol: 73,
            sodium: 167,
            carbohydrate: 5,
            protein: 22,
            sugar: 125,
            servingSize: "3 oz (85g)",
            image: "http://foodnetwork.sndimg.com/content/dam/images/food/fullset/2009/5/27/0/0125629_03_chicken-in-skillet_s4x3.jpg.rend.sni12col.landscape.jpeg"
        },
        "Corn on the cob": {
            calories: 155,
            fat: 3,
            cholesterol: 6,
            sodium: 29,
            carbohydrate: 32,
            protein: 4,
            sugar: 0,
            servingSize: "1 cob (146g)",
            image: "http://www.newhealthadvisor.com/images/1HT00602/corn-on-the-cob.jpg"
        }
    };


/**
* Parses Wolfram Nutrition Data 
* Wolfram Alpha API result
* @param array wolframResult - array of result pods
* @returns Object {
*               calories
*               fat
*               cholesterol
*               sodium
*               carbohydrate
*               protein
*               sugar
*               servingSize
*            };
*/
function parseWolframNutritionData(wolframResult) {
    
    var nutritionData = {
            calories: 0,        // Kcals
            fat: 0,             // Grams
            cholesterol: 0,     // Milligrams
            sodium: 0,          // Milligrams
            carbohydrate: 0,    // Grams
            protein: 0,         // Grams
            sugar: 0,           // Grams
            servingSize: 0      // "String"
        },
        nutritionCategories = [{
                labelName: "total calories",
                formalName: "calories"
            }, {
                labelName: "total fat",
                formalName: "fat"
            }, {
                labelName: "cholesterol",
                formalName: "cholesterol"
            }, {
                labelName: "sodium",
                formalName: "sodium"
            }, {
                labelName: "carbohydrates",
                formalName: "carbohydrate"
            }, {
                labelName: "protein",
                formalName: "protein"
            }, {
                labelName: "sugar",
                formalName: "sugar"
            }, {
                labelName: "serving size",
                formalName: "servingSize"
            }];
    
    wolframResult.forEach(function (pod) {
        if (pod.title.toLowerCase().indexOf("nutrition facts") === -1) {
            return;
        }
        
        // Turn Nutrition Labels/Facts to a List
        var nutritionFactsList = pod.subpods[0].text
            .replace(/(\n)/gm,"")
            .split('|')
            .map(function (nutritionFact) {
                return nutritionFact.trim();
            });
        
        // Obtain value for nutrition facts and values
        nutritionFactsList.forEach(function (nutritionFactString) {
            nutritionCategories.forEach(function (nutritionCategory) {
                var nutritionFactPos = 
                    nutritionFactString.indexOf(nutritionCategory.labelName);
                
                // Nutrition Fact does not in this string. Skip this!
                if (nutritionFactPos === -1) {
                    return;
                }
                
                // Obtain Nutrition Value (avoid units as we standardized)
                var nutritionValues = nutritionFactString.slice(
                    nutritionFactPos + nutritionCategory.labelName.length + 1, 
                    nutritionFactString.length
                ).trim().split(" ");
                
                if (nutritionCategory.formalName === "servingSize") {
                    nutritionData[nutritionCategory.formalName] = 
                        nutritionValues[0] + " " + nutritionValues[1];
                } else {
                    nutritionData[nutritionCategory.formalName] = 
                        Number(nutritionValues[0]);
                }
            });
        });
    });
    
    return nutritionData;
}


/**
* Returns nutritional information about some food, given that 
*   food's name. Specifically, we return calories, fat, cholesterol, 
*   sodium, carbohydrate and protein amounts.
* @param string foodName - Name of food whose nutrition info is 
*   being obtained
* @returns Promise
*/
function getInfo(foodName) {
    
    function promiseExecutor(resolve, reject) {
        if (foodName in cachedNutritionInfo) {
            resolve(cachedNutritionInfo[foodName]);
            return;
        }
        
        wolframAlpha.query(foodName, function (err, result) {
            if (err) {
                reject(err);
            }
            
            var nutritionObject = parseWolframNutritionData(result);
            
            cachedNutritionInfo[foodName] = nutritionObject;
            resolve(nutritionObject);
        });
    }
    
    return new Promise(promiseExecutor);
}

module.exports = exports = {
    getInfo: getInfo,
    parseWolframNutritionData: parseWolframNutritionData
};