document.addEventListener("DOMContentLoaded", () => {
    const smallDataSet = "https://dummyjson.com/users?limit=32"
    const bigDataSet = "https://dummyjson.com/users?limit=1000&delay=1000"

    let allTableData = []
    let tempDataForSort = []
    let isSort = false
    let isAscSort = true
    let currentPage = 1
    let rowsPerPage = 10

    let elements = document.querySelectorAll(".fade-in")
    elements.forEach((elem, i) => {
        setTimeout(() => {
            elem.classList.add("active")
        }, i * 400)
    })

    document.getElementById("dataset-small").addEventListener("click", () => {
        document.getElementById("dataset").value = smallDataSet
    })

    document.getElementById("dataset-big").addEventListener("click", () => {
        document.getElementById("dataset").value = bigDataSet
    })

    document.getElementById("remove-dataset").addEventListener("click", () => {
        if (allTableData.length === 0) {
            alert("Таблица пуста!")
        } else {
            allTableData = []
            tempDataForSort = []
            currentPage = 1

            let elements = document.querySelectorAll(".fade-in-table")
            elements.forEach((elem, i) => {
                setTimeout(() => {
                    elem.classList.remove("active")
                }, i * 100)
            })

            tableRender(allTableData)

            setTimeout(() => {
                document.querySelector(".fade-in-search").classList.remove("active")
            }, 300)

            document.getElementById("load-dataset").disabled = false
        }
    })

    document.getElementById("strict-search").addEventListener("change", () => {
        tableSearch()
    })

    document.getElementById("clean-search").addEventListener("click", () => {
        document.getElementById("search").value = ""
        document.getElementById("strict-search").checked = false
        tableRender(allTableData)
    })

    document.getElementById("load-dataset").addEventListener("click", () => {
        fetch(document.getElementById("dataset").value)
            .then((response) => response.json())
            .then((data) => {
                allTableData = data.users

                tableRender(allTableData)

                setTimeout(() => {
                    document.querySelector(".fade-in-search").classList.add("active")
                }, 500)

                document.getElementById("load-dataset").disabled = true
                document.getElementById("remove-dataset").disabled = false
            })
            .catch((error) => {
                alert("Извините, произошла ошибка")
                console.error(error)
            })
    })

    document.getElementById("search").addEventListener("input", () => {
        tableSearch()
    })

    function unpackingObject(obj) {
        const result = {}

        const nestedObject = (currentObject, parentKey = "") => {
            Object.entries(currentObject).forEach(([key, value]) => {
                const newKey = parentKey ? `${parentKey}—${key}` : key

                if (typeof value === "object") {
                    nestedObject(value, newKey)
                } else {
                    result[newKey] = value
                }
            })
        }

        nestedObject(obj)
        return result
    }

    function tableRender(tableData) {
        const info = document.querySelector(".count-rows")
        info.textContent = `Количество записей: ${tableData.length}`
        
        const thead = document.getElementById("table-wrapper").querySelector("thead")
        const tbody = document.getElementById("table-wrapper").querySelector("tbody")

        thead.innerHTML = ""
        tbody.innerHTML = ""

        if (tableData.length === 0) {
            setTimeout(() => {
                pagination.classList.remove("active")
            }, 500)
            return
        }

        tableData.forEach((value, i) => {
            tableData[i] = unpackingObject(value)
        })

        const columns = Object.keys(tableData[0])
        const headerRow = document.createElement("tr")

        headerRow.classList.add("fade-in-table")

        columns.forEach((col) => {
            const th = document.createElement("th")
            th.textContent = col
            th.addEventListener("click", () => {
                tableSort(col)
            })
            headerRow.appendChild(th)
        })

        thead.appendChild(headerRow)

        const iStart = (currentPage - 1) * rowsPerPage
        const iEnd = iStart + rowsPerPage
        const pageData = tableData.slice(iStart, iEnd)

        pageData.forEach((row) => {
            const tableRow = document.createElement("tr")
            tableRow.classList.add("fade-in-table")
            columns.forEach((col) => {
                const td = document.createElement("td")
                td.textContent = row[col]
                tableRow.appendChild(td)
            })
            tbody.appendChild(tableRow)
        })

        let elements = document.querySelectorAll(".fade-in-table")

        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add("active")
            }, index * 100)
        })

        renderPagination(tableData)
    }

    function tableSort(col) {
        let sortData

        if (tempDataForSort.length === 0) {
            tempDataForSort = [...allTableData]
        }

        if (!isSort) {
            isSort = true
            isAscSort = false

            sortData = [...allTableData].sort((a, b) => {
                if (typeof a[col] === "number" && typeof b[col] === "number") {
                    return b[col] - a[col]
                }
                return String(b[col]).localeCompare(String(a[col]))
            })
        } else if (!isAscSort) {
            isAscSort = true

            sortData = [...allTableData].sort((a, b) => {
                if (typeof a[col] === "number" && typeof b[col] === "number") {
                    return a[col] - b[col]
                }
                return String(a[col]).localeCompare(String(b[col]))
            })
        } else {
            isSort = false
            isAscSort = false

            sortData = [...tempDataForSort]
        }

        currentPage = 1
        tableRender(sortData)
    }

    function tableSearch() {
        let search = document.getElementById("search").value.trim()
        let searchResult = []

        if (search === "") {
            searchResult = [...allTableData]
        } else {
            allTableData.forEach((row) => {
                let matchFound = false
                Object.entries(row).forEach(([ , value]) => {
                    let isStrictSearch
                    document.getElementById("strict-search").checked ?
                        isStrictSearch = String(value) === search :
                        isStrictSearch = String(value).toLowerCase().includes(search.toLowerCase())
                    if (!matchFound && isStrictSearch) {
                        searchResult.push(row)
                        matchFound = true
                    }
                })
            })
        }

        tableRender(searchResult)
    }

    function renderPagination(tableData) {
        const pagination = document.getElementById("pagination")

        pagination.innerHTML = ""

        if (tableData.length == 0) {
            return
        }

        const startButton = document.createElement("button")
        startButton.classList.add("start-end-button")
        startButton.textContent = "⟪"
        startButton.disabled = currentPage === 1
        startButton.addEventListener("click", () => {
            currentPage = 1
            tableRender(tableData)
        })
        pagination.appendChild(startButton)

        const backButton = document.createElement("button")
        backButton.classList.add("back-forward-button")
        backButton.textContent = "⟨"
        backButton.disabled = currentPage === 1
        backButton.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--
                tableRender(tableData)
            }
        })
        pagination.appendChild(backButton)

        const allPages = Math.ceil(tableData.length / rowsPerPage)
        const info = document.createElement("p")
        info.textContent = `${currentPage}/${allPages}`
        pagination.appendChild(info)

        const forwardButton = document.createElement("button")
        forwardButton.classList.add("back-forward-button")
        forwardButton.textContent = "⟩"
        forwardButton.disabled = currentPage === allPages
        forwardButton.addEventListener("click", () => {
            if (currentPage < allPages) {
                currentPage++
                tableRender(tableData)
            }
        })
        pagination.appendChild(forwardButton)

        const endButton = document.createElement("button")
        endButton.classList.add("start-end-button")
        endButton.textContent = "⟫"
        endButton.disabled = currentPage === allPages
        endButton.addEventListener("click", () => {
            currentPage = allPages
            tableRender(tableData)
        })
        pagination.appendChild(endButton)

        setTimeout(() => {
            pagination.classList.add("active")
        }, 500)
    }

})